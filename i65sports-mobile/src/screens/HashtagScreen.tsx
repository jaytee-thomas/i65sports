import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { haptics } from '../utils/haptics';

const API_URL = 'http://192.168.86.226:3000/api';

interface Hashtag {
  tag: string;
  count: number;
}

interface HotTake {
  id: string;
  title: string;
  thumbUrl: string | null;
  author: {
    username: string;
  };
  _count: {
    reactions: number;
    comments: number;
  };
  createdAt: string;
}

export default function HashtagScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const { hashtag } = route.params as { hashtag?: string };

  const [trendingHashtags, setTrendingHashtags] = useState<Hashtag[]>([]);
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState(hashtag || '');
  const [loading, setLoading] = useState(true);
  const [loadingTakes, setLoadingTakes] = useState(false);

  useEffect(() => {
    fetchTrendingHashtags();
  }, []);

  useEffect(() => {
    if (selectedHashtag) {
      fetchHotTakesByHashtag(selectedHashtag);
    }
  }, [selectedHashtag]);

  const fetchTrendingHashtags = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/hashtags/trending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTrendingHashtags(response.data.hashtags || []);
    } catch (error) {
      console.error('Error fetching trending hashtags:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load hashtags',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchHotTakesByHashtag = async (tag: string) => {
    setLoadingTakes(true);
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/hot-takes/by-hashtag/${tag}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setHotTakes(response.data.hotTakes || []);
    } catch (error) {
      console.error('Error fetching hot takes by hashtag:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load Hot Takes',
        position: 'bottom',
      });
    } finally {
      setLoadingTakes(false);
    }
  };

  const renderHashtagCard = (item: Hashtag) => (
    <TouchableOpacity
      style={[
        styles.hashtagCard,
        selectedHashtag === item.tag && styles.hashtagCardActive,
      ]}
      onPress={() => {
        haptics.light();
        setSelectedHashtag(item.tag);
      }}
    >
      <Text style={[
        styles.hashtagText,
        selectedHashtag === item.tag && styles.hashtagTextActive,
      ]}>
        #{item.tag}
      </Text>
      <Text style={[
        styles.hashtagCount,
        selectedHashtag === item.tag && styles.hashtagCountActive,
      ]}>
        {item.count} {item.count === 1 ? 'take' : 'takes'}
      </Text>
    </TouchableOpacity>
  );

  const renderHotTake = ({ item }: { item: HotTake }) => (
    <TouchableOpacity
      style={styles.hotTakeCard}
      onPress={() => {
        haptics.light();
        (navigation as any).navigate('HotTakeDetail', { hotTake: item });
      }}
    >
      {item.thumbUrl && (
        <View style={styles.thumbnailContainer}>
          <Image source={{ uri: item.thumbUrl }} style={styles.thumbnail} />
          <View style={styles.playOverlay}>
            <Ionicons name="play-circle" size={48} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      )}
      <View style={styles.hotTakeInfo}>
        <Text style={styles.hotTakeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.hotTakeAuthor}>@{item.author.username}</Text>
        <View style={styles.hotTakeStats}>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color="#FF1493" />
            <Text style={styles.statText}>{item._count.reactions}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="chatbubble" size={14} color="#00FF9F" />
            <Text style={styles.statText}>{item._count.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF9F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trending Hashtags</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Trending Hashtags */}
      <View style={styles.hashtagsSection}>
        <FlatList
          data={trendingHashtags}
          renderItem={({ item }) => renderHashtagCard(item)}
          keyExtractor={(item) => item.tag}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hashtagsList}
        />
      </View>

      {/* Hot Takes for Selected Hashtag */}
      {selectedHashtag && (
        <View style={styles.takesSection}>
          <Text style={styles.sectionTitle}>
            #{selectedHashtag}
          </Text>
          {loadingTakes ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00FF9F" />
            </View>
          ) : (
            <FlatList
              data={hotTakes}
              renderItem={renderHotTake}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="pricetag-outline" size={48} color="#3A4166" />
                  <Text style={styles.emptyText}>No Hot Takes yet</Text>
                  <Text style={styles.emptySubtext}>
                    Be the first to tag with #{selectedHashtag}
                  </Text>
                </View>
              }
            />
          )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  hashtagsSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  hashtagsList: {
    padding: 16,
    gap: 12,
  },
  hashtagCard: {
    backgroundColor: '#1A1F3A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A4166',
    marginRight: 8,
  },
  hashtagCardActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  hashtagText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  hashtagTextActive: {
    color: '#0A0E27',
  },
  hashtagCount: {
    fontSize: 12,
    color: '#8892A6',
  },
  hashtagCountActive: {
    color: '#0A0E27',
  },
  takesSection: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#00FF9F',
    marginBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
  },
  hotTakeCard: {
    width: '48%',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  thumbnailContainer: {
    position: 'relative',
    aspectRatio: 9 / 16,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3A4166',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  hotTakeInfo: {
    padding: 12,
  },
  hotTakeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  hotTakeAuthor: {
    fontSize: 12,
    color: '#8892A6',
    marginBottom: 8,
  },
  hotTakeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#B8C5D6',
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
    textAlign: 'center',
  },
});

