import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { NotificationSkeleton } from '../components/SkeletonLoader';
import { NoNotificationsEmpty } from '../components/EmptyState';
import { haptics } from '../utils/haptics';

const API_URL = 'http://192.168.86.226:3000/api';

interface Notification {
  id: string;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'MENTION';
  message: string;
  read: boolean;
  createdAt: string;
  actor: {
    id: string;
    username: string;
    email: string;
  };
  hotTake?: {
    id: string;
    title: string;
    thumbUrl: string | null;
  };
}

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Skip fetching for now - API not ready yet
    setLoading(false);
    
    // Uncomment when backend is ready:
    // fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load notifications',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = await getToken();
      await axios.patch(
        `${API_URL}/notifications`,
        { notificationId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Update local state
      setNotifications(prev =>
        prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await getToken();
      await axios.patch(
        `${API_URL}/notifications`,
        { markAllAsRead: true },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      Toast.show({
        type: 'success',
        text1: 'All notifications marked as read',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    haptics.light(); // Add haptic feedback on press
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.type === 'FOLLOW') {
      // Navigate to actor's profile
      // (navigation as any).navigate('UserProfile', { userId: notification.actor.id });
      Toast.show({
        type: 'info',
        text1: 'Profile view coming soon!',
        position: 'bottom',
      });
    } else if (notification.hotTake) {
      // Navigate to Hot Take detail
      (navigation as any).navigate('HotTakeDetail', {
        hotTake: {
          id: notification.hotTake.id,
          title: notification.hotTake.title,
          author: notification.actor,
        },
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LIKE':
        return { name: 'heart', color: '#FF1493' };
      case 'COMMENT':
        return { name: 'chatbubble', color: '#00FF9F' };
      case 'FOLLOW':
        return { name: 'person-add', color: '#00A8E8' };
      case 'MENTION':
        return { name: 'at', color: '#FFB800' };
      default:
        return { name: 'notifications', color: '#8892A6' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const icon = getNotificationIcon(item.type);

    return (
      <TouchableOpacity
        style={[styles.notificationCard, !item.read && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
          <Ionicons name={icon.name as any} size={24} color={icon.color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.actorName}>@{item.actor.username}</Text>
            {' '}
            {item.message.replace(`${item.actor.username} `, '')}
          </Text>
          <Text style={styles.notificationTime}>{getTimeAgo(item.createdAt)}</Text>
        </View>
        {item.hotTake?.thumbUrl && (
          <Image
            source={{ uri: item.hotTake.thumbUrl }}
            style={styles.thumbnail}
            resizeMode="cover"
          />
        )}
        {!item.read && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Notifications</Text>
        </View>
        <View style={{ padding: 16 }}>
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
          <NotificationSkeleton />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllAsRead}>
            <Text style={styles.markAllButton}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      {notifications.length > 0 ? (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#00FF9F"
            />
          }
        />
      ) : (
        <NoNotificationsEmpty />
      )}
    </SafeAreaView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  markAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  list: {
    padding: 16,
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  unreadCard: {
    backgroundColor: '#1F2546',
    borderColor: '#00FF9F',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actorName: {
    fontWeight: 'bold',
    color: '#00FF9F',
  },
  notificationTime: {
    fontSize: 12,
    color: '#8892A6',
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 12,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF9F',
    position: 'absolute',
    top: 12,
    right: 12,
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
  },
});

