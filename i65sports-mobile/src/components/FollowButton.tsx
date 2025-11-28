import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

interface FollowButtonProps {
  userId: string;
  username: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, username, onFollowChange }: FollowButtonProps) {
  const { user } = useUser();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/follows?userId=${userId}`);
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      setActionLoading(true);
      if (isFollowing) {
        // Unfollow
        await axios.delete(`${API_URL}/follows?followingId=${userId}`);
        setIsFollowing(false);
        onFollowChange?.(false);
        
        Toast.show({
          type: 'info',
          text1: 'Unfollowed',
          text2: `You unfollowed @${username}`,
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        // Follow
        await axios.post(`${API_URL}/follows`, { followingId: userId });
        setIsFollowing(true);
        onFollowChange?.(true);
        
        Toast.show({
          type: 'success',
          text1: 'Following! 🎉',
          text2: `You're now following @${username}`,
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error: any) {
      console.error('Error toggling follow:', error);
      
      Toast.show({
        type: 'error',
        text1: 'Failed to follow',
        text2: error.response?.data?.error || 'Please try again',
        position: 'bottom',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <TouchableOpacity style={styles.buttonLoading} disabled>
        <ActivityIndicator size="small" color="#00FF9F" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isFollowing ? styles.buttonFollowing : styles.buttonNotFollowing,
        actionLoading && styles.buttonDisabled,
      ]}
      onPress={handleFollow}
      disabled={actionLoading}
    >
      {actionLoading ? (
        <ActivityIndicator size="small" color={isFollowing ? '#00FF9F' : '#0A0E27'} />
      ) : (
        <Text
          style={[
            styles.buttonText,
            isFollowing ? styles.buttonTextFollowing : styles.buttonTextNotFollowing,
          ]}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonNotFollowing: {
    backgroundColor: '#00FF9F',
  },
  buttonFollowing: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00FF9F',
  },
  buttonLoading: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  buttonTextNotFollowing: {
    color: '#0A0E27',
  },
  buttonTextFollowing: {
    color: '#00FF9F',
  },
});

