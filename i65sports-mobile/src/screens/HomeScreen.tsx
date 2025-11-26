import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');

// Your backend API URL - use the same IP from upload.ts
const API_URL = 'http://192.168.86.226:3000/api';

interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  venueName: string | null;
  createdAt: string;
  author: {
    username: string;
  };
}

export default function HomeScreen() {
  const navigation = useNavigation();
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHotTakes();
  }, []);

  const fetchHotTakes = async () => {
    try {
      setLoading(true);
      console.log('Fetching Hot Takes from:', `${API_URL}/hot-takes`);
      
      const response = await axios.get(`${API_URL}/hot-takes`, {
        params: { limit: 20 }
      });
      
      console.log('Hot Takes loaded:', response.data.hotTakes.length);
      setHotTakes(response.data.hotTakes);
      setError(null);
    } catch (err) {
      console.error('Error fetching Hot Takes:', err);
      setError('Failed to load Hot Takes');
    } finally {
      setLoading(false);
    }
  };

  const renderHotTake = ({ item }: { item: HotTake }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('HotTakeDetail' as never, { hotTake: item } as never)}
    >
      {/* Video Thumbnail/Player */}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: item.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          useNativeControls={false}
        />
      </View>
      
      {/* Card Info */}
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
          onPress={fetchHotTakes}
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
        <Text style={styles.headerSubtitle}>
          {hotTakes.length} {hotTakes.length === 1 ? 'take' : 'takes'}
        </Text>
        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => navigation.navigate('Camera' as never)}
        >
          <Text style={styles.uploadButtonText}>Upload Your Take</Text>
        </TouchableOpacity>
      </View>

      {/* Hot Takes List */}
      {hotTakes.length > 0 ? (
        <FlatList
          data={hotTakes}
          renderItem={renderHotTake}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshing={loading}
          onRefresh={fetchHotTakes}
        />
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No Hot Takes yet!</Text>
          <Text style={styles.emptySubtext}>
            Be the first to record one 📹
          </Text>
        </View>
      )}
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
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  uploadButton: {
    backgroundColor: '#FF1493', // Hot pink!
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  video: {
    width: '100%',
    height: '100%',
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
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
  },
});
