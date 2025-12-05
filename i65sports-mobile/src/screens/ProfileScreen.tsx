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
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { ProfileGridSkeleton, Skeleton } from '../components/SkeletonLoader';
import { handleApiError } from '../utils/errorHandler';
import FollowButton from '../components/FollowButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Toast from 'react-native-toast-message';

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
  followersCount?: number;
  followingCount?: number;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useUser();
  const { signOut, getToken } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    const userId = user?.id;
    
    if (!userId) {
      console.log('No userId available');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = await getToken();
      
      if (!token) {
        console.error('No auth token available');
        setError('Authentication required');
        return;
      }

      console.log('Loading profile for userId:', userId);

      const response = await axios.get(`${API_URL}/users/${userId}`, {
        headers: { 
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      console.log('Profile loaded:', response.data);
      // Backend returns { user: {...} }, so extract the user object
      setProfile(response.data.user);
    } catch (err: any) {
      console.error('Error loading profile:', err.response?.status, err.response?.data);
      
      if (err.response?.status === 401) {
        setError('Please sign in again');
      } else {
        handleApiError(err, 'Loading Profile');
        setError('Failed to load profile');
      }
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

  const handleDeleteHotTake = async (hotTakeId: string) => {
    Alert.alert(
      'Delete Hot Take',
      'Are you sure you want to delete this Hot Take? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              
              await axios.delete(`${API_URL}/hot-takes/${hotTakeId}`, {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Hot Take removed',
                position: 'bottom',
              });
              
              // Refresh profile
              loadProfile();
            } catch (error) {
              console.error('Error deleting hot take:', error);
              Toast.show({
                type: 'error',
                text1: 'Failed to delete',
                text2: 'Please try again',
                position: 'bottom',
              });
            }
          },
        },
      ]
    );
  };

  const renderVideoThumbnail = ({ item }: { item: HotTake }) => (
    <TouchableOpacity
      style={styles.videoThumbnail}
      onPress={() => {
        const hotTakeWithAuthor = {
          ...item,
          author: {
            id: profile?.id,
            username: profile?.username || 'user',
          },
        };
        (navigation as any).navigate('HotTakeDetail', { hotTake: hotTakeWithAuthor });
      }}
      onLongPress={() => handleDeleteHotTake(item.id)}
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
          {item._count?.reactions || 0}
        </Text>
      </View>
      {/* Delete Icon Hint */}
      <View style={styles.deleteHint}>
        <Ionicons name="trash-outline" size={12} color="rgba(255, 255, 255, 0.6)" />
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

  // FIXED: Safe check for hotTakes before calling reduce
  const totalLikes = profile?.hotTakes?.reduce(
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
            <Text style={styles.statNumber}>{profile?.hotTakes?.length || 0}</Text>
            <Text style={styles.statLabel}>Hot Takes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{totalLikes}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statNumber}>{profile?.followersCount || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
        </View>
        <Text style={styles.username}>@{profile?.username}</Text>
        <Text style={styles.bio}>🏀 Sports fanatic | 🎥 Hot Takes creator</Text>
        {/* Action Buttons */}
        {user?.emailAddresses[0].emailAddress === profile?.email ? (
          <>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => navigation.navigate('EditProfile' as never)}
              >
                <Ionicons name="create-outline" size={18} color="#00FF9F" />
                <Text style={styles.editButtonText}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => navigation.navigate('Settings' as never)}
              >
                <Ionicons name="settings-outline" size={18} color="#00FF9F" />
                <Text style={styles.settingsButtonText}>Settings</Text>
              </TouchableOpacity>
            </View>
            
            {/* My Drafts Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Drafts' as never)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="document-text-outline" size={24} color="#00FF9F" />
                <Text style={styles.menuItemText}>My Drafts</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8892A6" />
            </TouchableOpacity>

            {/* My Collections Menu Item */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Collections' as never)}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name="folder-outline" size={24} color="#00FF9F" />
                <Text style={styles.menuItemText}>My Collections</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#8892A6" />
            </TouchableOpacity>
          </>
        ) : (
          <FollowButton 
            userId={profile?.id || ''} 
            username={profile?.username || ''}
            onFollowChange={(following) => {
              console.log('Follow status changed:', following);
            }}
          />
        )}
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    marginBottom: 16,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#00FF9F',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#00FF9F',
    fontSize: 14,
    fontWeight: '600',
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#00FF9F',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  settingsButtonText: {
    color: '#00FF9F',
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
  deleteHint: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 10,
    padding: 4,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
    backgroundColor: '#0A0E27',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});