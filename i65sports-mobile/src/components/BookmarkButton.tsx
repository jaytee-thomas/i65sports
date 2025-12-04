import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_URL = 'http://192.168.86.226:3000/api';

interface BookmarkButtonProps {
  takeId: string;
  initialBookmarked?: boolean;
  onToggle?: (bookmarked: boolean) => void;
  size?: number;
  color?: string;
}

export const BookmarkButton: React.FC<BookmarkButtonProps> = ({
  takeId,
  initialBookmarked = false,
  onToggle,
  size = 24,
  color = '#FFFFFF',
}) => {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isLoading, setIsLoading] = useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  const { getToken } = useAuth();

  const handleToggle = async () => {
    if (isLoading) return;

    try {
      setIsLoading(true);

      // Optimistic update
      const newBookmarked = !isBookmarked;
      setIsBookmarked(newBookmarked);

      // Animate
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/bookmarks`,
        { takeId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsBookmarked(response.data.bookmarked);

      Toast.show({
        type: 'success',
        text1: response.data.bookmarked ? 'Bookmarked! 🔖' : 'Bookmark removed',
        position: 'bottom',
        visibilityTime: 1500,
      });

      if (onToggle) {
        onToggle(response.data.bookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      // Revert on error
      setIsBookmarked(!isBookmarked);

      Toast.show({
        type: 'error',
        text1: 'Failed to bookmark',
        position: 'bottom',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      disabled={isLoading}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons
          name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          size={size}
          color={isBookmarked ? '#FFD700' : color}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

