import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface User {
  id: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
}

export default function NewMessageScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      searchUsers();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(response.data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user: User) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.find((u) => u.id === user.id);
      if (isSelected) {
        return prev.filter((u) => u.id !== user.id);
      }
      return [...prev, user];
    });
  };

  const createConversation = async () => {
    if (selectedUsers.length === 0) return;

    try {
      setIsCreating(true);
      const token = await getToken();

      const type = selectedUsers.length === 1 ? 'DIRECT' : 'GROUP';
      const participantIds = selectedUsers.map((u) => u.id);

      const response = await axios.post(
        `${API_URL}/conversations`,
        {
          type,
          participantIds,
          ...(type === 'GROUP' && {
            name: `Group with ${selectedUsers.map((u) => u.username).join(', ')}`,
          }),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const conversation = response.data.conversation;

      // Navigate to chat
      navigation.navigate('Chat' as never, {
        conversationId: conversation.id,
        conversationName:
          type === 'DIRECT'
            ? `@${selectedUsers[0].username}`
            : conversation.name,
        isGroup: type === 'GROUP',
      } as never);
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderSelectedUser = ({ item }: { item: User }) => (
    <View style={styles.selectedUserChip}>
      <Text style={styles.selectedUserText}>@{item.username}</Text>
      <TouchableOpacity onPress={() => toggleUserSelection(item)}>
        <Ionicons name="close-circle" size={20} color="#FF1493" />
      </TouchableOpacity>
    </View>
  );

  const renderSearchResult = ({ item }: { item: User }) => {
    const isSelected = selectedUsers.find((u) => u.id === item.id);

    return (
      <TouchableOpacity
        style={styles.userItem}
        onPress={() => toggleUserSelection(item)}
      >
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={20} color="#00FF9F" />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.username}>@{item.username}</Text>
          {item.bio && (
            <Text style={styles.userBio} numberOfLines={1}>
              {item.bio}
            </Text>
          )}
        </View>
        {isSelected && (
          <View style={styles.checkmark}>
            <Ionicons name="checkmark-circle" size={24} color="#00FF9F" />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Message</Text>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedUsers.length === 0 && styles.nextButtonDisabled,
          ]}
          onPress={createConversation}
          disabled={selectedUsers.length === 0 || isCreating}
        >
          {isCreating ? (
            <ActivityIndicator color="#00FF9F" />
          ) : (
            <Text
              style={[
                styles.nextText,
                selectedUsers.length === 0 && styles.nextTextDisabled,
              ]}
            >
              Next
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#8892A6" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            placeholderTextColor="#8892A6"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      </View>

      {/* Selected Users */}
      {selectedUsers.length > 0 && (
        <View style={styles.selectedUsersContainer}>
          <Text style={styles.selectedLabel}>To:</Text>
          <FlatList
            data={selectedUsers}
            renderItem={renderSelectedUser}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedUsersList}
          />
        </View>
      )}

      {/* Search Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF9F" />
        </View>
      ) : searchResults.length === 0 && searchQuery.length > 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={64} color="#8892A6" />
          <Text style={styles.emptyText}>No users found</Text>
          <Text style={styles.emptySubtext}>Try a different search</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          renderItem={renderSearchResult}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContent}
        />
      )}

      {/* Suggested Users (when no search) */}
      {searchQuery.length === 0 && (
        <View style={styles.suggestedContainer}>
          <Text style={styles.suggestedTitle}>Suggested</Text>
          <Text style={styles.suggestedSubtitle}>
            Search for users to start a conversation
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  cancelButton: {
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 16,
    color: '#8892A6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  nextButton: {
    paddingVertical: 8,
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
  },
  nextTextDisabled: {
    color: '#8892A6',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  selectedUsersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  selectedLabel: {
    fontSize: 16,
    color: '#8892A6',
    marginRight: 12,
  },
  selectedUsersList: {
    gap: 8,
  },
  selectedUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    paddingLeft: 16,
    paddingRight: 8,
    paddingVertical: 8,
    gap: 8,
  },
  selectedUserText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  resultsContent: {
    paddingVertical: 8,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  userBio: {
    fontSize: 14,
    color: '#8892A6',
  },
  checkmark: {
    marginLeft: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
  },
  suggestedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  suggestedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  suggestedSubtitle: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
    textAlign: 'center',
  },
});

