import React, { useState, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { haptics } from '../utils/haptics';

const API_URL = 'http://192.168.86.226:3000/api';

interface FollowButtonProps {
  userId: string;
  username: string;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ userId, username, onFollowChange }: FollowButtonProps) {
  const { getToken } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/follows?userId=${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(response.data.isFollowing);
    } catch (error) {
      console.error('Error checking follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    haptics.light(); // Add haptic feedback on button press
    
    if (actionLoading) return;

    const previousState = isFollowing;
    setIsFollowing(!isFollowing);
    setActionLoading(true);

    try {
      const token = await getToken();

      if (!previousState) {
        // Following
        await axios.post(
          `${API_URL}/follows`,
          { followingId: userId },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        haptics.success(); // Add success haptic
        Toast.show({
          type: 'success',
          text1: 'Following!',
          position: 'bottom',
          visibilityTime: 1500,
        });
        onFollowChange?.(true);
      } else {
        // Unfollowing
        await axios.delete(`${API_URL}/follows?followingId=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        haptics.medium(); // Add medium haptic for unfollow
        Toast.show({
          type: 'info',
          text1: 'Unfollowed',
          position: 'bottom',
          visibilityTime: 1500,
        });
        onFollowChange?.(false);
      }
    } catch (error: any) {
      haptics.error(); // Add error haptic
      // Revert state on error
      setIsFollowing(previousState);
      
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
