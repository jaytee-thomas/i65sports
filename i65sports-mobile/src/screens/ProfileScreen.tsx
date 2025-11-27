import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const ITEM_SIZE = (width - 8) / COLUMN_COUNT;

const API_URL = 'http://localhost:3000/api'; // For simulator

interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  thumbUrl?: string | null;
  venueName: string | null;
  createdAt: string;
  _count: {
    comments: number;
    reactions: number;
  };
}

interface UserProfile {
  id: string;
  username: string;
  email: string;
  hotTakes: HotTake[];
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Test user ID
  const userId = 'cmig5amau0000st344d7gkjti';

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Just fetch user's hot takes - we already know the user info
      const hotTakesResponse = await axios.get(
        `${API_URL}/hot-takes?limit=50`
      );

      // Filter to only show testuser's hot takes
      const userHotTakes = hotTakesResponse.data.hotTakes.filter(
        (ht: any) => ht.author.username === 'testuser'
      );

      setProfile({
        id: userId,
        username: 'testuser',
        email: 'test@i65sports.com',
        hotTakes: userHotTakes,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile({
        id: userId,
        username: 'testuser',
        email: 'test@i65sports.com',
        hotTakes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const renderVideoThumbnail = ({ item }: { item: HotTake }) => (
    <TouchableOpacity
      style={styles.videoThumbnail}
      onPress={() =>
        navigation.navigate('HotTakeDetail' as never, {
          hotTake: {
            ...item,
            author: {
              id: userId,
              username: profile?.username || 'testuser',
            },
          },
        } as never)
      }
    >
      {item.thumbUrl ? (
        <Image 
          source={{ uri: item.thumbUrl }} 
          style={styles.thumbnailImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.thumbnailPlaceholder}>
          <Ionicons name="videocam" size={32} color="#FFFFFF" />
        </View>
      )}

      {/* Play Icon */}
      <View style={styles.thumbnailPlayIcon}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
      </View>

      {/* View Count Overlay */}
      <View style={styles.thumbnailOverlay}>
        <Ionicons name="heart" size={12} color="#FFFFFF" />
        <Text style={styles.thumbnailStat}>
          {item._count.reactions || 0}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00FF9F" />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </View>
    );
  }

  const hotTakesCount = profile?.hotTakes.length || 0;
  const totalLikes = profile?.hotTakes.reduce(
    (sum, ht) => sum + (ht._count.reactions || 0),
    0
  ) || 0;

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#00FF9F" />
          </View>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{hotTakesCount}</Text>
            <Text style={styles.statLabel}>Hot Takes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{totalLikes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
      </View>

      {/* Username & Bio */}
      <View style={styles.info}>
        <Text style={styles.username}>@{profile?.username || 'testuser'}</Text>
        <Text style={styles.bio}>
          🏀 Sports fanatic | 🎥 Hot Takes creator
        </Text>
      </View>

      {/* Edit Profile Button */}
      <TouchableOpacity style={styles.editButton}>
        <Text style={styles.editButtonText}>Edit Profile</Text>
      </TouchableOpacity>

      {/* Grid of Hot Takes */}
      {hotTakesCount > 0 ? (
        <FlatList
          data={profile?.hotTakes}
          renderItem={renderVideoThumbnail}
          keyExtractor={(item) => item.id}
          numColumns={COLUMN_COUNT}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-outline" size={64} color="#3A4166" />
          <Text style={styles.emptyText}>No Hot Takes Yet</Text>
          <Text style={styles.emptySubtext}>
            Record your first take from the Camera tab
          </Text>
          <TouchableOpacity
            style={styles.recordButton}
            onPress={() => navigation.navigate('Camera' as never)}
          >
            <Text style={styles.recordButtonText}>Record Hot Take</Text>
          </TouchableOpacity>
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
  },
  loadingText: {
    color: '#B8C5D6',
    fontSize: 16,
    marginTop: 12,
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#00FF9F',
  },
  stats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#B8C5D6',
  },
  info: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#B8C5D6',
  },
  editButton: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A4166',
    alignItems: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    padding: 2,
  },
  videoThumbnail: {
    width: ITEM_SIZE - 4,
    height: ITEM_SIZE - 4,
    margin: 2,
    position: 'relative',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  thumbnailPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlayIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -15,
    marginLeft: -15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  thumbnailStat: {
    color: '#FFFFFF',
    fontSize: 11,
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 24,
  },
  recordButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  recordButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

