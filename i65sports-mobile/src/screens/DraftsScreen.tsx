import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

interface Draft {
  id: string;
  title?: string;
  videoUri: string;
  thumbnailUri?: string;
  sport?: string;
  scheduledFor?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DraftsScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();

  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadDrafts();
    }, [])
  );

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/drafts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDrafts(response.data.drafts);
    } catch (error) {
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadDrafts();
  };

  const deleteDraft = async (id: string) => {
    Alert.alert('Delete Draft', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await getToken();
            await axios.delete(`${API_URL}/drafts/${id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            setDrafts(drafts.filter((d) => d.id !== id));

            Toast.show({
              type: 'success',
              text1: 'Draft deleted',
              position: 'bottom',
            });
          } catch (error) {
            console.error('Error deleting draft:', error);
            Toast.show({
              type: 'error',
              text1: 'Failed to delete draft',
              position: 'bottom',
            });
          }
        },
      },
    ]);
  };

  const editDraft = (draft: Draft) => {
    navigation.navigate('UploadHotTake' as never, {
      draftId: draft.id,
      videoUri: draft.videoUri,
      title: draft.title,
      sport: draft.sport,
      scheduledFor: draft.scheduledFor,
    } as never);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderDraft = ({ item }: { item: Draft }) => {
    const isScheduled = item.scheduledFor && new Date(item.scheduledFor) > new Date();

    return (
      <TouchableOpacity
        style={styles.draftCard}
        onPress={() => editDraft(item)}
      >
        <View style={styles.thumbnail}>
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.6)" />
        </View>

        <View style={styles.draftInfo}>
          <Text style={styles.draftTitle} numberOfLines={2}>
            {item.title || 'Untitled Draft'}
          </Text>

          <View style={styles.draftMeta}>
            {isScheduled ? (
              <View style={styles.scheduledBadge}>
                <Ionicons name="calendar-outline" size={14} color="#FFD700" />
                <Text style={styles.scheduledText}>
                  Scheduled: {new Date(item.scheduledFor!).toLocaleDateString()}
                </Text>
              </View>
            ) : (
              <Text style={styles.draftDate}>
                Saved {formatDate(item.updatedAt)}
              </Text>
            )}
          </View>

          {item.sport && (
            <View style={styles.sportBadge}>
              <Text style={styles.sportText}>{item.sport}</Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteDraft(item.id)}
        >
          <Ionicons name="trash-outline" size={22} color="#FF1493" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drafts</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Drafts List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading drafts...</Text>
        </View>
      ) : drafts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color="#8892A6" />
          <Text style={styles.emptyTitle}>No Drafts Yet</Text>
          <Text style={styles.emptySubtitle}>
            Save your recordings as drafts to publish later
          </Text>
        </View>
      ) : (
        <FlatList
          data={drafts}
          renderItem={renderDraft}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#00FF9F"
            />
          }
        />
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  backButton: {},
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  listContent: {
    padding: 16,
  },
  draftCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 100,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  draftInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  draftTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  draftMeta: {
    marginBottom: 8,
  },
  draftDate: {
    fontSize: 12,
    color: '#8892A6',
  },
  scheduledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scheduledText: {
    fontSize: 12,
    color: '#FFD700',
    fontWeight: '500',
  },
  sportBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#00FF9F',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sportText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deleteButton: {
    padding: 12,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8892A6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
    textAlign: 'center',
  },
});

