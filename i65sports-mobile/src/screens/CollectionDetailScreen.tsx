import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';
const { width } = Dimensions.get('window');

type RouteParams = {
  CollectionDetail: {
    collectionId: string;
  };
};

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  userId: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  _count: {
    items: number;
    followers: number;
  };
  items: Array<{
    id: string;
    hotTake: {
      id: string;
      title: string;
      videoUrl: string;
      thumbUrl?: string;
      thumbnailUrl?: string;
      author: {
        username: string;
      };
      _count: {
        reactions: number;
        comments: number;
      };
    };
  }>;
}

export default function CollectionDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'CollectionDetail'>>();
  const navigation = useNavigation();
  const { collectionId } = route.params;
  const { getToken } = useAuth();
  const { user } = useUser();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/collections/${collectionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCollection(response.data.collection);
    } catch (error) {
      console.error('Error loading collection:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load collection',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!collection) return;

    try {
      await Share.share({
        message: `Check out my collection "${collection.name}" on i65Sports! 🔥`,
        title: collection.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Collection',
      'Are you sure? This cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              await axios.delete(`${API_URL}/collections/${collectionId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              Toast.show({
                type: 'success',
                text1: 'Collection deleted',
                position: 'bottom',
              });

              navigation.goBack();
            } catch (error) {
              console.error('Error deleting collection:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete collection',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  const removeFromCollection = async (itemId: string, takeId: string) => {
    try {
      const token = await getToken();
      await axios.delete(
        `${API_URL}/collections/${collectionId}/items?takeId=${takeId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCollection((prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((item) => item.id !== itemId),
              _count: {
                ...prev._count,
                items: prev._count.items - 1,
              },
            }
          : null
      );

      Toast.show({
        type: 'success',
        text1: 'Removed from collection',
        position: 'bottom',
      });
    } catch (error) {
      console.error('Error removing item:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to remove item',
        position: 'bottom',
      });
    }
  };

  const renderHotTake = ({ item }: { item: any }) => {
    const isOwner = collection?.userId === user?.id;

    return (
      <TouchableOpacity
        style={styles.hotTakeCard}
        onPress={() =>
          navigation.navigate('HotTakeDetail' as never, {
            hotTake: item.hotTake,
          } as never)
        }
      >
        <View style={styles.thumbnail}>
          <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
        </View>
        <View style={styles.hotTakeInfo}>
          <Text style={styles.hotTakeTitle} numberOfLines={2}>
            {item.hotTake.title}
          </Text>
          <Text style={styles.hotTakeAuthor}>
            @{item.hotTake.author.username}
          </Text>
          <View style={styles.hotTakeStats}>
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color="#FF1493" />
              <Text style={styles.statText}>
                {item.hotTake._count.reactions}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="chatbubble" size={14} color="#00FF9F" />
              <Text style={styles.statText}>
                {item.hotTake._count.comments}
              </Text>
            </View>
          </View>
        </View>
        {isOwner && (
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFromCollection(item.id, item.hotTake.id)}
          >
            <Ionicons name="close-circle" size={24} color="#FF1493" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!collection) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Collection not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = collection.userId === user?.id;

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
        <View style={styles.headerActions}>
          {isOwner && (
            <>
              <TouchableOpacity style={styles.headerButton}>
                <Ionicons name="create-outline" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <Ionicons name="trash-outline" size={24} color="#FF1493" />
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity style={styles.headerButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={collection.items}
        renderItem={renderHotTake}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={styles.collectionHeader}>
            {/* Icon */}
            <View style={styles.collectionIcon}>
              <Ionicons name="folder" size={48} color="#00FF9F" />
            </View>

            {/* Info */}
            <Text style={styles.collectionName}>{collection.name}</Text>
            {collection.description && (
              <Text style={styles.collectionDescription}>
                {collection.description}
              </Text>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{collection._count.items}</Text>
                <Text style={styles.statLabel}>Hot Takes</Text>
              </View>
              {collection.isPublic && (
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>
                    {collection._count.followers}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
              )}
              <View style={styles.statBox}>
                <Ionicons
                  name={collection.isPublic ? 'globe' : 'lock-closed'}
                  size={20}
                  color="#00FF9F"
                />
                <Text style={styles.statLabel}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </Text>
              </View>
            </View>

            {/* Creator */}
            <Text style={styles.creatorText}>
              by @{collection.user.username}
            </Text>

            {/* Divider */}
            <View style={styles.divider} />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-open-outline" size={64} color="#8892A6" />
            <Text style={styles.emptyText}>No Hot Takes yet</Text>
            <Text style={styles.emptySubtext}>
              {isOwner
                ? 'Start adding Hot Takes to your collection'
                : 'This collection is empty'}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1F3A',
  },
  backButton: {
    padding: 4,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 16,
  },
  collectionHeader: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
  },
  collectionIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  collectionName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  collectionDescription: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#8892A6',
  },
  creatorText: {
    fontSize: 14,
    color: '#00FF9F',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#1A1F3A',
    marginTop: 24,
  },
  hotTakeCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 120,
    height: 120,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  hotTakeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  hotTakeTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hotTakeAuthor: {
    fontSize: 13,
    color: '#00FF9F',
    marginBottom: 8,
  },
  hotTakeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#B8C5D6',
  },
  removeButton: {
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF1493',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
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
    textAlign: 'center',
  },
});

