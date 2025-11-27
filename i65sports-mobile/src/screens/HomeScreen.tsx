import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Image,
  TextInput,
  ScrollView,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');

const API_URL = 'http://localhost:3000/api';

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
  };
}

export default function HomeScreen() {
  const navigation = useNavigation();
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

      const response = await axios.get(`${API_URL}/hot-takes`, { params });
      
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
      filtered = filtered.filter(hotTake => 
        hotTake.sport && hotTake.sport.toLowerCase() === activeSport.toLowerCase()
      );
    }
    
    // Then filter by search query
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(hotTake => 
        hotTake.title.toLowerCase().includes(lowerQuery) ||
        hotTake.author.username.toLowerCase().includes(lowerQuery) ||
        (hotTake.venueName && hotTake.venueName.toLowerCase().includes(lowerQuery))
      );
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

  const renderHotTake = ({ item }: { item: HotTake }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('HotTakeDetail' as never, { hotTake: item } as never)}
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
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardMeta}>
          {item.venueName || 'Unknown Venue'} • @{item.author.username}
        </Text>
        <Text style={styles.cardDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
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

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF9F" />
        <Text style={styles.loadingText}>Loading Hot Takes...</Text>
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

        {/* Filter Chips */}
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
      </View>

      {/* Hot Takes List */}
      <FlatList
        data={displayedHotTakes}
        renderItem={renderHotTake}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={() => fetchHotTakes()}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
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
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
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
