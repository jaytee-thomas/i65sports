import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { haptics } from '../utils/haptics';
import { SkeletonLoader } from '../components/SkeletonLoader';
import FollowButton from '../components/FollowButton';

const API_URL = 'http://192.168.86.226:3000/api';

interface User {
  id: string;
  username: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  _count: {
    hotTakes: number;
    followers: number;
    following: number;
  };
  isFollowing: boolean;
}

export default function DiscoverScreen() {
  const { getToken } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<User[]>([]);
  const [trendingCreators, setTrendingCreators] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchDiscoverData();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.length > 0) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  const fetchDiscoverData = async () => {
    try {
      const token = await getToken();
      
      const [suggestedRes, trendingRes] = await Promise.all([
        axios.get(`${API_URL}/users/suggested`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/users/trending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setSuggestedUsers(suggestedRes.data.users || []);
      setTrendingCreators(trendingRes.data.users || []);
    } catch (error) {
      console.error('Error fetching discover data:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load suggestions',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/users/search`, {
        params: { q: searchQuery },
        headers: { Authorization: `Bearer ${token}` },
      });

      setSearchResults(response.data.users || []);
      haptics.light();
    } catch (error) {
      console.error('Error searching users:', error);
      Toast.show({
        type: 'error',
        text1: 'Search failed',
        position: 'bottom',
      });
    } finally {
      setSearching(false);
    }
  };

  const renderUserCard = (user: User, showFollowButton: boolean = true) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => {
        haptics.light();
        // Navigate to user profile
        Toast.show({
          type: 'info',
          text1: 'User profiles coming soon!',
          position: 'bottom',
        });
      }}
    >
      {user.avatarUrl ? (
        <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <Ionicons name="person" size={32} color="#8892A6" />
        </View>
      )}

      <View style={styles.userInfo}>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio} numberOfLines={2}>{user.bio}</Text>}
        <View style={styles.stats}>
          <Text style={styles.statText}>
            {user._count.hotTakes} {user._count.hotTakes === 1 ? 'take' : 'takes'}
          </Text>
          <Text style={styles.statDivider}>•</Text>
          <Text style={styles.statText}>
            {user._count.followers} {user._count.followers === 1 ? 'follower' : 'followers'}
          </Text>
        </View>
      </View>

      {showFollowButton && (
        <FollowButton
          userId={user.id}
          initialIsFollowing={user.isFollowing}
          onFollowChange={(isFollowing) => {
            // Update local state
            const updateUser = (u: User) => 
              u.id === user.id ? { ...u, isFollowing } : u;
            
            setSearchResults(prev => prev.map(updateUser));
            setSuggestedUsers(prev => prev.map(updateUser));
            setTrendingCreators(prev => prev.map(updateUser));
          }}
        />
      )}
    </TouchableOpacity>
  );

  const renderSectionHeader = (title: string, icon: string) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon as any} size={20} color="#00FF9F" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Discover</Text>
        </View>
        <View style={styles.searchContainer}>
          <SkeletonLoader width="100%" height={48} borderRadius={12} />
        </View>
        <View style={{ padding: 16 }}>
          <SkeletonLoader width={150} height={24} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={80} borderRadius={12} style={{ marginBottom: 12 }} />
          <SkeletonLoader width="100%" height={80} borderRadius={12} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8892A6" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          placeholderTextColor="#8892A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSearchResults([]);
            }}
            style={styles.clearButton}
          >
            <Ionicons name="close-circle" size={20} color="#8892A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      <FlatList
        data={searchQuery.length > 0 ? searchResults : []}
        renderItem={({ item }) => renderUserCard(item)}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          searchQuery.length === 0 ? (
            <>
              {/* Trending Creators */}
              {trendingCreators.length > 0 && (
                <>
                  {renderSectionHeader('Trending Creators', 'trending-up')}
                  {trendingCreators.slice(0, 5).map(user => (
                    <View key={user.id}>{renderUserCard(user)}</View>
                  ))}
                </>
              )}

              {/* Suggested For You */}
              {suggestedUsers.length > 0 && (
                <>
                  {renderSectionHeader('Suggested For You', 'sparkles')}
                  {suggestedUsers.slice(0, 10).map(user => (
                    <View key={user.id}>{renderUserCard(user)}</View>
                  ))}
                </>
              )}
            </>
          ) : searching ? (
            <View style={styles.searchingContainer}>
              <ActivityIndicator size="large" color="#00FF9F" />
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="search" size={48} color="#3A4166" />
              <Text style={styles.emptyText}>No users found</Text>
              <Text style={styles.emptySubtext}>Try a different search term</Text>
            </View>
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    margin: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 12,
  },
  clearButton: {
    padding: 4,
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A4166',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A4166',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 13,
    color: '#B8C5D6',
    marginBottom: 6,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#8892A6',
  },
  statDivider: {
    fontSize: 12,
    color: '#8892A6',
    marginHorizontal: 6,
  },
  searchingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B8C5D6',
    marginTop: 4,
  },
});

