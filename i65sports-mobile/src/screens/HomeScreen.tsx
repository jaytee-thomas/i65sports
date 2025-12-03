import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import OddsTicker from '../components/OddsTicker';
import { HotTakeCardSkeleton } from '../components/SkeletonLoader';
import Toast from 'react-native-toast-message';
import { TrendingBadge } from '../components/TrendingBadge';
import { useTrendingDetection } from '../hooks/useTrendingDetection';

// Haptics utility
const haptics = {
  light: () => {},
  medium: () => {},
  error: () => {},
};

// Error handler
const handleApiError = (error: any, context: string) => {
  console.error(`${context}:`, error);
};

const API_URL = 'http://192.168.86.226:3000/api';

interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  thumbUrl?: string;
  sport: string;
  author: {
    id: string;
    username: string;
    email: string;
    avatarUrl?: string;
  };
  _count: {
    reactions: number;
    comments: number;
  };
  createdAt: string;
}

interface Game {
  id: string;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  startTime: string;
}

const sports = [
  { id: 'all', name: 'All', icon: '🏆' },
  { id: 'NBA', name: 'NBA', icon: '🏀' },
  { id: 'NFL', name: 'NFL', icon: '🏈' },
  { id: 'MLB', name: 'MLB', icon: '⚾' },
  { id: 'NHL', name: 'NHL', icon: '🏒' },
  { id: 'Soccer', name: 'Soccer', icon: '⚽' },
  { id: 'NCAA', name: 'NCAA', icon: '🎓' },
];

export default function HomeScreen() {
  const navigation = useNavigation();
  const { userId, getToken } = useAuth();

  // State
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Trending detection
  const trendingTakes = useTrendingDetection(hotTakes);

  // Fetch Hot Takes
  const fetchHotTakes = async (refresh = false) => {
    if (loading || loadingMore) return;

    try {
      refresh ? setLoading(true) : setLoadingMore(true);
      setError(null);

      const token = await getToken();
      const params: any = {
        limit: 20,
      };

      if (!refresh && cursor) {
        params.cursor = cursor;
      }

      if (selectedSport && selectedSport !== 'all') {
        params.sport = selectedSport;
      }

      console.log('📡 Fetching Hot Takes:', params);

      const response = await axios.get(`${API_URL}/hot-takes`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
        timeout: 15000,
      });

      console.log('✅ Hot Takes loaded:', response.data.hotTakes.length);

      if (refresh || !cursor) {
        setHotTakes(response.data.hotTakes || []);
      } else {
        setHotTakes((prev) => [...prev, ...(response.data.hotTakes || [])]);
      }

      setCursor(response.data.nextCursor);
      setHasMore(!!response.data.nextCursor);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching Hot Takes:', err);
      handleApiError(err, 'Loading Hot Takes');
      setError('Failed to load Hot Takes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  // Fetch Games for OddsTicker
  const fetchGames = async () => {
    // Mock data until API is ready
    setGames([
      {
        id: '1',
        league: 'NBA',
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        homeOdds: -180,
        awayOdds: 155,
        startTime: '7:30 PM',
      },
      {
        id: '2',
        league: 'NFL',
        homeTeam: 'Chiefs',
        awayTeam: 'Raiders',
        homeOdds: -210,
        awayOdds: 175,
        startTime: '8:00 PM',
      },
    ]);
  };

  // Initial load
  useEffect(() => {
    console.log('🏠 HomeScreen mounted');
    fetchHotTakes(true);
    fetchGames();
  }, []);

  // Refetch when sport changes
  useEffect(() => {
    if (selectedSport !== null) {
      console.log('🏀 Sport changed to:', selectedSport);
      setCursor(null);
      setHotTakes([]);
      fetchHotTakes(true);
    }
  }, [selectedSport]);

  // Handlers
  const handleRefresh = () => {
    setRefreshing(true);
    setCursor(null);
    fetchHotTakes(true);
    fetchGames();
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && cursor) {
      fetchHotTakes(false);
    }
  };

  const handleSportFilter = (sportId: string) => {
    console.log('🏀 Sport chip tapped:', sportId);
    haptics.light();
    setSelectedSport(sportId === 'all' ? null : sportId);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Filter Hot Takes by search
  const filteredHotTakes = hotTakes.filter((hotTake) => {
    if (!searchQuery) return true;

    const searchLower = searchQuery.toLowerCase();
    return (
      hotTake.title?.toLowerCase().includes(searchLower) ||
      hotTake.author.username?.toLowerCase().includes(searchLower) ||
      hotTake.sport?.toLowerCase().includes(searchLower)
    );
  });

  // Render Hot Take Card
  const renderHotTake = ({ item }: { item: HotTake }) => {
    const handlePress = () => {
      console.log('🎬 Hot Take card pressed:', item.title);
      haptics.light();
      navigation.navigate('HotTakeDetail' as never, { hotTake: item } as never);
    };

    const handleLike = async (e: any) => {
      e.stopPropagation();
      haptics.medium();
      try {
        const token = await getToken();
        await axios.post(
          `${API_URL}/hot-takes/${item.id}/reactions`,
          { type: 'LIKE' },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setHotTakes((prev) =>
          prev.map((take) =>
            take.id === item.id
              ? {
                  ...take,
                  _count: {
                    ...take._count,
                    reactions: take._count.reactions + 1,
                  },
                }
              : take
          )
        );

        Toast.show({
          type: 'success',
          text1: 'Liked!',
          position: 'bottom',
          visibilityTime: 1000,
        });
      } catch (error) {
        console.error('Error liking:', error);
        haptics.error();
      }
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Thumbnail */}
        <Image
          source={{ uri: item.thumbnailUrl || item.thumbUrl || '' }}
          style={styles.thumbnail}
          resizeMode="cover"
        />

        {/* Play Icon Overlay */}
        <View style={styles.playOverlay} pointerEvents="none">
          <Ionicons name="play-circle" size={64} color="rgba(255,255,255,0.95)" />
        </View>

        {/* Content */}
        <View style={styles.cardContent}>
          {/* Author Row */}
          <View style={styles.authorRow}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={18} color="#00FF9F" />
            </View>
            <Text style={styles.authorName} numberOfLines={1}>
              {item.author.username}
            </Text>
            {trendingData && (
              <TrendingBadge
                label={trendingData.label}
                velocity={trendingData.velocity}
              />
            )}
            {item.sport && (
              <View style={styles.sportBadge}>
                <Text style={styles.sportBadgeText}>{item.sport}</Text>
              </View>
            )}
          </View>

          {/* Title */}
          {item.title && (
            <Text style={styles.cardTitle} numberOfLines={2}>
              {item.title}
            </Text>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <TouchableOpacity style={styles.statButton} onPress={handleLike}>
              <Ionicons name="heart-outline" size={22} color="#FFFFFF" />
              <Text style={styles.statText}>{item._count.reactions}</Text>
            </TouchableOpacity>

            <View style={styles.statButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#FFFFFF" />
              <Text style={styles.statText}>{item._count.comments}</Text>
            </View>

            <TouchableOpacity style={styles.statButton}>
              <Ionicons name="share-outline" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // List Header (Search + Sport Chips)
  const renderListHeader = () => (
    <View>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#8892A6" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search Hot Takes..."
          placeholderTextColor="#8892A6"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color="#8892A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sport Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportsContainer}
        contentContainerStyle={styles.sportsContent}
        scrollEnabled={true}
        nestedScrollEnabled={true}
      >
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportChip,
              (selectedSport === sport.id ||
                (selectedSport === null && sport.id === 'all')) &&
                styles.sportChipActive,
            ]}
            onPress={() => handleSportFilter(sport.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.sportIcon}>{sport.icon}</Text>
            <Text
              style={[
                styles.sportName,
                (selectedSport === sport.id ||
                  (selectedSport === null && sport.id === 'all')) &&
                  styles.sportNameActive,
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Hot Takes Count */}
      <Text style={styles.sectionTitle}>
        {filteredHotTakes.length} take{filteredHotTakes.length !== 1 ? 's' : ''}
      </Text>
    </View>
  );

  // List Footer (Loading More)
  const renderListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00FF9F" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  // Empty State
  const renderEmpty = () => {
    if (loading) {
      return (
        <View>
          <HotTakeCardSkeleton />
          <HotTakeCardSkeleton />
          <HotTakeCardSkeleton />
        </View>
      );
    }

    if (error) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="alert-circle-outline" size={64} color="#8892A6" />
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 16, fontWeight: 'bold' }}>
            Something went wrong
          </Text>
          <Text style={{ color: '#8892A6', fontSize: 14, marginTop: 8, textAlign: 'center' }}>
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchHotTakes(true)}
            style={{ backgroundColor: '#00FF9F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 }}
          >
            <Text style={{ color: '#0A0E27', fontWeight: 'bold' }}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (searchQuery) {
      return (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <Ionicons name="search-outline" size={64} color="#8892A6" />
          <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 16, fontWeight: 'bold' }}>
            No results found
          </Text>
          <Text style={{ color: '#8892A6', fontSize: 14, marginTop: 8 }}>
            No Hot Takes match "{searchQuery}"
          </Text>
        </View>
      );
    }

    return (
      <View style={{ padding: 40, alignItems: 'center' }}>
        <Ionicons name="videocam-outline" size={64} color="#8892A6" />
        <Text style={{ color: '#FFFFFF', fontSize: 18, marginTop: 16, fontWeight: 'bold' }}>
          No Hot Takes yet
        </Text>
        <Text style={{ color: '#8892A6', fontSize: 14, marginTop: 8 }}>
          Be the first to share your take!
        </Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Camera' as never)}
          style={{ backgroundColor: '#00FF9F', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 20 }}
        >
          <Text style={{ color: '#0A0E27', fontWeight: 'bold' }}>Record Hot Take</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* OddsTicker */}
      <OddsTicker games={games} />

      {/* Hot Takes List */}
      <FlatList
        data={filteredHotTakes}
        renderItem={renderHotTake}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#00FF9F"
            colors={['#00FF9F']}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderListHeader}
        ListFooterComponent={renderListFooter}
        ListEmptyComponent={renderEmpty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  list: {
    paddingBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sportsContainer: {
    marginBottom: 12,
  },
  sportsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3A4166',
    gap: 6,
  },
  sportChipActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  sportIcon: {
    fontSize: 16,
  },
  sportName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sportNameActive: {
    color: '#0A0E27',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#B8C5D6',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1A1F3A',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: 320,
    backgroundColor: '#0A0E27',
  },
  playOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  cardContent: {
    padding: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  sportBadge: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sportBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 14,
    color: '#8892A6',
  },
});
