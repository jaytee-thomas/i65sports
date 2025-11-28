import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { HotTakeCardSkeleton } from '../components/SkeletonLoader';
import { handleApiError } from '../utils/errorHandler';
import OddsTicker from '../components/OddsTicker';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// Create AnimatedFlatList for native driver support
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<HotTake>);

const API_URL = 'http://192.168.86.226:3000/api';

const SPORTS = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'basketball', name: 'Basketball', icon: 'basketball' },
  { id: 'football', name: 'Football', icon: 'football' },
  { id: 'baseball', name: 'Baseball', icon: 'baseball' },
  { id: 'hockey', name: 'Hockey', icon: 'disc' },
  { id: 'soccer', name: 'Soccer', icon: 'football-outline' },
];

interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  thumbUrl: string | null;
  venueName: string | null;
  createdAt: string;
  sport?: string | null;
  author: {
    username: string;
    email: string;
  };
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { getToken } = useAuth();
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [filteredHotTakes, setFilteredHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fade effect for header
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    fetchHotTakes();
  }, []);

  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, hotTakes, selectedSport]);

  const fetchHotTakes = async (cursor?: string | null) => {
    try {
      if (cursor) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      console.log('Fetching Hot Takes from:', `${API_URL}/hot-takes`);
      
      const params: any = { limit: 20 };
      if (cursor) {
        params.cursor = cursor;
      }

      const response = await axios.get(`${API_URL}/hot-takes`, { 
        params,
        timeout: 15000 // 15 second timeout
      });
      
      console.log('Hot Takes loaded:', response.data.hotTakes.length);
      
      if (cursor) {
        setHotTakes(prev => [...prev, ...response.data.hotTakes]);
      } else {
        setHotTakes(response.data.hotTakes);
      }
      
      setNextCursor(response.data.nextCursor);
      setHasMore(!!response.data.nextCursor);
      setError(null);
    } catch (err) {
      console.error('Error fetching Hot Takes:', err);
      handleApiError(err, 'Loading Hot Takes');
      setError('Failed to load Hot Takes');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleSearch = (query: string, sport?: string | null) => {
    const activeSport = sport !== undefined ? sport : selectedSport;
    
    let filtered = hotTakes;
    
    // Filter by sport first
    if (activeSport && activeSport !== 'all') {
      filtered = filtered.filter(hotTake => {
        // Safety check: make sure sport exists and is not null
        if (!hotTake.sport) return false;
        return hotTake.sport.toLowerCase() === activeSport.toLowerCase();
      });
    }
    
    // Then filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(hotTake => {
        // Safety check each field before calling toLowerCase()
        const titleMatch = hotTake.title?.toLowerCase().includes(lowerQuery) || false;
        const usernameMatch = hotTake.author?.username?.toLowerCase().includes(lowerQuery) || false;
        const venueMatch = hotTake.venueName ? hotTake.venueName.toLowerCase().includes(lowerQuery) : false;
        
        return titleMatch || usernameMatch || venueMatch;
      });
    }
    
    setFilteredHotTakes(filtered);
    setIsSearching(query.trim().length > 0 || (activeSport !== null && activeSport !== 'all'));
  };

  const handleSportFilter = (sportId: string) => {
    const newSport = sportId === 'all' ? null : sportId;
    setSelectedSport(newSport);
    handleSearch(searchQuery, newSport);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSelectedSport(null);
    setIsSearching(false);
    setFilteredHotTakes(hotTakes);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore && nextCursor && !isSearching) {
      fetchHotTakes(nextCursor);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchHotTakes();
    setRefreshing(false);
  };

  const handleDeleteHotTake = async (hotTakeId: string) => {
    Alert.alert(
      'Delete Hot Take',
      'Are you sure you want to delete this Hot Take?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              
              await axios.delete(`${API_URL}/hot-takes/${hotTakeId}`, {
                timeout: 10000,
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              Toast.show({
                type: 'success',
                text1: 'Deleted! 🗑️',
                position: 'bottom',
              });
              
              // Remove from local state
              setHotTakes(prev => prev.filter(ht => ht.id !== hotTakeId));
              setFilteredHotTakes(prev => prev.filter(ht => ht.id !== hotTakeId));
            } catch (error) {
              console.error('Error deleting:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  const renderHotTake = ({ item }: { item: HotTake }) => {
    const isMyHotTake = item.author.email === user?.emailAddresses[0].emailAddress;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => (navigation as any).navigate('HotTakeDetail', { hotTake: item })}
      >
        <View style={styles.videoContainer}>
          {item.thumbUrl ? (
            <Image 
              source={{ uri: item.thumbUrl }} 
              style={styles.thumbnail}
              resizeMode="cover"
            />
          ) : (
            <Video
              source={{ uri: item.videoUrl }}
              style={styles.video}
              resizeMode={ResizeMode.COVER}
              shouldPlay={false}
              isLooping={false}
              useNativeControls={false}
            />
          )}
          
          <View style={styles.playIconOverlay}>
            <Ionicons name="play-circle" size={48} color="rgba(255, 255, 255, 0.9)" />
          </View>
        </View>
        
        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleContainer}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>
                {item.venueName || 'Unknown Venue'} • @{item.author.username}
              </Text>
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            {isMyHotTake && (
              <TouchableOpacity 
                style={styles.deleteButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleDeleteHotTake(item.id);
                }}
              >
                <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => (
    <Animated.View style={{ opacity: headerOpacity }}>
      {/* Odds Ticker */}
      <OddsTicker />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons 
          name="search" 
          size={20} 
          color="#8892A6" 
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by title, user, or venue..."
          placeholderTextColor="#8892A6"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#8892A6" />
          </TouchableOpacity>
        )}
      </View>

      {/* Sport Filters */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {SPORTS.map(sport => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.filterChip,
              (selectedSport === sport.id || (sport.id === 'all' && !selectedSport)) && styles.filterChipActive
            ]}
            onPress={() => handleSportFilter(sport.id)}
          >
            <Ionicons 
              name={sport.icon as any} 
              size={16} 
              color={(selectedSport === sport.id || (sport.id === 'all' && !selectedSport)) ? '#0A0E27' : '#B8C5D6'} 
            />
            <Text style={[
              styles.filterChipText,
              (selectedSport === sport.id || (sport.id === 'all' && !selectedSport)) && styles.filterChipTextActive
            ]}>
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.headerSubtitle}>
        {isSearching ? (
          `${filteredHotTakes.length} result${filteredHotTakes.length !== 1 ? 's' : ''}`
        ) : (
          <>
            {hotTakes.length} {hotTakes.length === 1 ? 'take' : 'takes'}
            {hasMore && ' • Scroll for more'}
          </>
        )}
      </Text>
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loadingMore || isSearching) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#00FF9F" />
        <Text style={styles.footerText}>Loading more...</Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (isSearching) {
      return (
        <View style={styles.emptyState}>
          <Ionicons name="search-outline" size={64} color="#3A4166" />
          <Text style={styles.emptyText}>No results found</Text>
          <Text style={styles.emptySubtext}>
            Try a different search or filter
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No Hot Takes yet!</Text>
        <Text style={styles.emptySubtext}>
          Be the first to record one 📹
        </Text>
      </View>
    );
  };

  const displayedHotTakes = searchQuery.trim() || selectedSport ? filteredHotTakes : hotTakes;

  if (loading && hotTakes.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>TRENDING HOT TAKES 🔥</Text>
        </View>
        {/* Skeleton Loading */}
        <View style={styles.list}>
          <HotTakeCardSkeleton />
          <HotTakeCardSkeleton />
          <HotTakeCardSkeleton />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>😕 {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => fetchHotTakes()}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TRENDING HOT TAKES 🔥</Text>
      </View>

      {/* Hot Takes List */}
      <AnimatedFlatList
        data={displayedHotTakes}
        renderItem={renderHotTake}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#00FF9F" />
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="videocam-off" size={64} color="#8892A6" />
              <Text style={styles.emptyText}>No Hot Takes found</Text>
              <Text style={styles.emptySubtext}>Be the first to record one!</Text>
            </View>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color="#00FF9F" />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#00FF9F"
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  centerContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: '#FFFFFF',
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    marginBottom: 12,
  },
  filtersContent: {
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: '#3A4166',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  filterChipTextActive: {
    color: '#0A0E27',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  list: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A4166',
    overflow: 'hidden',
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#2A3154',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playIconOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cardInfo: {
    padding: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#B8C5D6',
    marginBottom: 2,
  },
  cardDate: {
    fontSize: 11,
    color: '#8892A6',
  },
  loadingText: {
    color: '#B8C5D6',
    fontSize: 16,
    marginTop: 12,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    paddingTop: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#B8C5D6',
    fontSize: 14,
    marginTop: 8,
  },
});
