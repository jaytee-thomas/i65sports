import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ProfileGridSkeleton, Skeleton } from '../components/SkeletonLoader';
import { handleApiError } from '../utils/errorHandler';
import axios from 'axios';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 8) / 3;

const API_URL = 'http://192.168.86.226:3000/api';

interface HotTake {
  id: string;
  title: string;
  videoUrl: string;
  thumbUrl: string | null;
  createdAt: string;
  _count: {
    reactions: number;
    comments: number;
  };
}

interface Profile {
  id: string;
  username: string;
  email: string;
  hotTakes: HotTake[];
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      
      // Fetch all hot takes
      const hotTakesResponse = await axios.get(`${API_URL}/hot-takes?limit=50`);
      
      // Filter to only show current user's hot takes
      const userHotTakes = hotTakesResponse.data.hotTakes.filter(
        (ht: any) => ht.author.email === user?.emailAddresses[0].emailAddress
      );

      setProfile({
        id: user?.id || '',
        username: user?.username || user?.emailAddresses[0].emailAddress.split('@')[0] || 'user',
        email: user?.emailAddresses[0].emailAddress || '',
        hotTakes: userHotTakes,
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      handleApiError(error, 'Loading Profile');
      
      setProfile({
        id: user?.id || '',
        username: user?.username || 'user',
        email: user?.emailAddresses[0].emailAddress || '',
        hotTakes: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
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
              id: profile?.id,
              username: profile?.username || 'user',
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
      <View style={styles.thumbnailPlayIcon}>
        <Ionicons name="play" size={20} color="#FFFFFF" />
      </View>
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
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Skeleton width={80} height={80} borderRadius={40} />
          </View>
          <View style={styles.statsRow}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={styles.stat}>
                <Skeleton width={40} height={24} />
                <Skeleton width={60} height={14} style={{ marginTop: 4 }} />
              </View>
            ))}
          </View>
          <Skeleton width={120} height={20} style={{ alignSelf: 'center', marginBottom: 8 }} />
          <Skeleton width={200} height={16} style={{ alignSelf: 'center', marginBottom: 16 }} />
        </View>
        <View style={{ padding: 2 }}>
          <ProfileGridSkeleton />
          <ProfileGridSkeleton />
          <ProfileGridSkeleton />
        </View>
      </View>
    );
  }

  const totalLikes = profile?.hotTakes.reduce(
    (sum, ht) => sum + (ht._count.reactions || 0),
    0
  ) || 0;

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={40} color="#00FF9F" />
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{profile?.hotTakes.length || 0}</Text>
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
        <Text style={styles.username}>@{profile?.username}</Text>
        <Text style={styles.bio}>🏀 Sports fanatic | 🎥 Hot Takes creator</Text>
        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Hot Takes Grid */}
      {profile?.hotTakes && profile.hotTakes.length > 0 ? (
        <FlatList
          data={profile.hotTakes}
          renderItem={renderVideoThumbnail}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="videocam-outline" size={64} color="#3A4166" />
          <Text style={styles.emptyText}>No Hot Takes yet</Text>
          <Text style={styles.emptySubtext}>Tap the camera to record your first one!</Text>
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1A1F3A',
    borderWidth: 2,
    borderColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
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
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  bio: {
    fontSize: 14,
    color: '#B8C5D6',
    textAlign: 'center',
    marginBottom: 16,
  },
  signOutButton: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'center',
  },
  signOutButtonText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    padding: 2,
  },
  row: {
    justifyContent: 'flex-start',
  },
  videoThumbnail: {
    width: ITEM_SIZE - 4,
    height: ITEM_SIZE - 4,
    margin: 2,
    backgroundColor: '#1A1F3A',
    borderRadius: 4,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
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
  uploadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#2A3154',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF9F',
    borderRadius: 4,
  },
  progressText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  uploadingText: {
    color: '#B8C5D6',
    fontSize: 14,
    textAlign: 'center',
  },
});
