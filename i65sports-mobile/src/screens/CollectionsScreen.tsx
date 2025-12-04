import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';
const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface Collection {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  coverImage?: string;
  user: {
    username: string;
  };
  _count: {
    items: number;
    followers: number;
  };
  items: Array<{
    hotTake: {
      thumbUrl?: string;
      videoUrl: string;
    };
  }>;
}

export default function CollectionsScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();

  const [collections, setCollections] = useState<Collection[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'collections' | 'bookmarks'>('collections');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (activeTab === 'collections') {
        const response = await axios.get(`${API_URL}/collections`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCollections(response.data.collections);
      } else {
        const response = await axios.get(`${API_URL}/bookmarks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBookmarks(response.data.bookmarks);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBackPress = () => {
    // Try to go back first, if not possible navigate to Home tab
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home' as never);
    }
  };

  const renderCollection = ({ item }: { item: Collection }) => {
    const previewImages = item.items.slice(0, 3);

    return (
      <TouchableOpacity
        style={styles.collectionCard}
        onPress={() =>
          (navigation as any).navigate('CollectionDetail', {
            collectionId: item.id,
          })
        }
      >
        {/* Preview Grid */}
        <View style={styles.previewGrid}>
          {previewImages.length === 0 ? (
            <View style={styles.emptyPreview}>
              <Ionicons name="folder-outline" size={40} color="#8892A6" />
            </View>
          ) : previewImages.length === 1 ? (
            <View style={styles.singlePreview}>
              <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
            </View>
          ) : (
            <View style={styles.gridPreview}>
              {previewImages.map((preview, index) => (
                <View key={index} style={styles.gridItem}>
                  <Ionicons name="play-circle" size={24} color="rgba(255,255,255,0.8)" />
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.collectionInfo}>
          <View style={styles.collectionHeader}>
            <Text style={styles.collectionName} numberOfLines={1}>
              {item.name}
            </Text>
            {!item.isPublic && (
              <Ionicons name="lock-closed" size={14} color="#8892A6" />
            )}
          </View>
          <Text style={styles.collectionStats}>
            {item._count.items} Hot Takes
            {item.isPublic && ` • ${item._count.followers} followers`}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderBookmark = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.bookmarkCard}
      onPress={() =>
        (navigation as any).navigate('HotTakeDetail', {
          hotTake: item.hotTake,
        })
      }
    >
      <View style={styles.bookmarkThumbnail}>
        <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.8)" />
      </View>
      <View style={styles.bookmarkInfo}>
        <Text style={styles.bookmarkTitle} numberOfLines={2}>
          {item.hotTake.title}
        </Text>
        <Text style={styles.bookmarkAuthor}>
          @{item.hotTake.author.username}
        </Text>
        <View style={styles.bookmarkStats}>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={14} color="#FF1493" />
            <Text style={styles.statText}>{item.hotTake._count.reactions}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble" size={14} color="#00FF9F" />
            <Text style={styles.statText}>{item.hotTake._count.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Library</Text>
        
        {activeTab === 'collections' ? (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => navigation.navigate('CreateCollection' as never)}
          >
            <Ionicons name="add" size={24} color="#00FF9F" />
          </TouchableOpacity>
        ) : (
          <View style={styles.createButton} />
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'collections' && styles.activeTab]}
          onPress={() => setActiveTab('collections')}
        >
          <Ionicons
            name="folder"
            size={20}
            color={activeTab === 'collections' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'collections' && styles.activeTabText,
            ]}
          >
            Collections
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'bookmarks' && styles.activeTab]}
          onPress={() => setActiveTab('bookmarks')}
        >
          <Ionicons
            name="bookmark"
            size={20}
            color={activeTab === 'bookmarks' ? '#00FF9F' : '#8892A6'}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'bookmarks' && styles.activeTabText,
            ]}
          >
            Bookmarks
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : activeTab === 'collections' ? (
        collections.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={64} color="#8892A6" />
            <Text style={styles.emptyTitle}>No Collections Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create collections to organize your favorite Hot Takes
            </Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('CreateCollection' as never)}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <Text style={styles.createFirstText}>Create Collection</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={collections}
            renderItem={renderCollection}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.gridContent}
            columnWrapperStyle={styles.columnWrapper}
          />
        )
      ) : bookmarks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="bookmark-outline" size={64} color="#8892A6" />
          <Text style={styles.emptyTitle}>No Bookmarks Yet</Text>
          <Text style={styles.emptySubtitle}>
            Bookmark Hot Takes to watch them later
          </Text>
        </View>
      ) : (
        <FlatList
          data={bookmarks}
          renderItem={renderBookmark}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
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
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#1A1F3A',
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 1,
    borderColor: '#00FF9F',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8892A6',
  },
  activeTabText: {
    color: '#00FF9F',
  },
  gridContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  columnWrapper: {
    gap: 16,
    marginBottom: 16,
  },
  collectionCard: {
    width: CARD_WIDTH,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewGrid: {
    width: '100%',
    height: CARD_WIDTH,
    backgroundColor: '#0A0E27',
  },
  emptyPreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  singlePreview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
  },
  gridPreview: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '50%',
    height: '50%',
    backgroundColor: '#1A1F3A',
    borderWidth: 0.5,
    borderColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionInfo: {
    padding: 12,
  },
  collectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  collectionName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  collectionStats: {
    fontSize: 12,
    color: '#8892A6',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  bookmarkCard: {
    flexDirection: 'row',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  bookmarkThumbnail: {
    width: 120,
    height: 120,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  bookmarkTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bookmarkAuthor: {
    fontSize: 13,
    color: '#00FF9F',
    marginBottom: 8,
  },
  bookmarkStats: {
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
  createFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FF9F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  createFirstText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

