import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Animated,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Share } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import socketService from '../services/socket';
import { LiveReactionBar } from '../components/LiveReactionBar';
import { FloatingEmojiContainer } from '../components/FloatingEmojiContainer';
import { LiveChatRoom } from '../components/LiveChatRoom';
import { TrendingBadge } from '../components/TrendingBadge';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://192.168.86.226:3000/api';

type RouteParams = {
  HotTakeDetail: {
    hotTake: {
      id: string;
      title: string;
      videoUrl: string;
      venueName: string | null;
      createdAt: string;
      author: {
        id: string;
        username: string;
      };
      _count?: {
        reactions: number;
        comments: number;
      };
    };
  };
};

interface Comment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

export default function HotTakeDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'HotTakeDetail'>>();
  const navigation = useNavigation();
  const { hotTake } = route.params;
  const { getToken } = useAuth();
  const { user } = useUser();

  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(hotTake._count?.reactions || 0);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // Live features state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [reactionCounts, setReactionCounts] = useState<{ [emoji: string]: number }>({});
  const [floatingEmojis, setFloatingEmojis] = useState<Array<{ emoji: string; timestamp: number }>>([]);
  const [trendingLabel, setTrendingLabel] = useState('');

  useEffect(() => {
    loadComments();
  }, []);

  // Socket connection for live features
  useEffect(() => {
    const gameId = hotTake.id; // Using takeId as gameId for now
    
    // Join game room
    socketService.joinGame(gameId);

    // Listen for reactions
    const reactionHandler = (data: any) => {
      console.log('⚡ Received reaction:', data);
      
      // Update reaction counts
      setReactionCounts((prev) => ({
        ...prev,
        [data.emoji]: (prev[data.emoji] || 0) + 1,
      }));

      // Add floating emoji
      setFloatingEmojis((prev) => [
        ...prev,
        { emoji: data.emoji, timestamp: Date.now() },
      ]);
    };

    // Listen for chat messages
    const messageHandler = (data: any) => {
      console.log('💬 Received message:', data);
      setChatMessages((prev) => [...prev, data]);
    };

    socketService.onReaction(reactionHandler);
    socketService.onMessage(messageHandler);

    return () => {
      socketService.leaveGame(gameId);
      socketService.removeListener('reaction-received', reactionHandler);
      socketService.removeListener('message-received', messageHandler);
    };
  }, [hotTake.id]);

  useEffect(() => {
    if (showControls) {
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      resetControlsTimeout();
    } else {
      Animated.timing(controlsOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls]);

  const resetControlsTimeout = () => {
    if (controlsTimeout.current) {
      clearTimeout(controlsTimeout.current);
    }
    controlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const loadComments = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/hot-takes/${hotTake.id}/comments`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const togglePlayback = async () => {
    setShowControls(true);
    resetControlsTimeout();

    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoPress = () => {
    togglePlayback();
    setShowControls(true);
    resetControlsTimeout();
  };

  const handleLike = async () => {
    try {
      const newLiked = !isLiked;
      const newCount = newLiked ? likeCount + 1 : likeCount - 1;
      
      // Optimistic update
      setIsLiked(newLiked);
      setLikeCount(newCount);

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

      // API call
      const token = await getToken();
      await axios.post(
        `${API_URL}/hot-takes/${hotTake.id}/reactions`,
        { type: 'LIKE' },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Toast.show({
        type: 'success',
        text1: newLiked ? 'Liked! ❤️' : 'Unliked',
        position: 'bottom',
        visibilityTime: 1000,
      });
    } catch (error) {
      console.error('Error liking:', error);
      
      // Revert on error
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);

      Toast.show({
        type: 'error',
        text1: 'Failed to like',
        text2: 'Please try again',
        position: 'bottom',
      });
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const token = await getToken();
      
      const response = await axios.post(
        `${API_URL}/hot-takes/${hotTake.id}/comments`,
        { text: newComment.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setComments([response.data.comment, ...comments]);
      setNewComment('');

      Toast.show({
        type: 'success',
        text1: 'Comment Posted! 💬',
        position: 'bottom',
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error('Error posting comment:', error);

      Toast.show({
        type: 'error',
        text1: 'Failed to post comment',
        text2: 'Please try again',
        position: 'bottom',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareUrl = hotTake.videoUrl;
      const message = `Check out this Hot Take: "${hotTake.title}" by @${hotTake.author.username} on i65Sports! 🔥\n\n${shareUrl}`;

      await Share.share({
        message: message,
        url: shareUrl,
        title: hotTake.title,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share Hot Take');
      console.error('Share error:', error);
    }
  };

  const handleReaction = (emoji: string) => {
    const gameId = hotTake.id;
    
    socketService.sendReaction({
      gameId,
      takeId: hotTake.id,
      emoji,
      userId: user?.id || 'current-user-id',
      username: user?.username || 'current-user',
    });
  };

  const handleSendChatMessage = (message: string) => {
    const gameId = hotTake.id;
    
    socketService.sendChatMessage({
      gameId,
      userId: user?.id || 'current-user-id',
      username: user?.username || 'current-user',
      message,
    });
  };

  const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsPlaying(status.isPlaying);
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={32} color="#FFFFFF" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.videoContainer}
        onPress={handleVideoPress}
        activeOpacity={1}
      >
        <Video
          ref={videoRef}
          source={{ uri: hotTake.videoUrl }}
          style={styles.video}
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay
          isLooping
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />

        {/* Video Controls Overlay */}
        {showControls && (
          <Animated.View
            style={[styles.videoControls, { opacity: controlsOpacity }]}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[styles.progressFill, { width: `${progress * 100}%` }]}
                />
              </View>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Play/Pause Overlay */}
        {showControls && !isPlaying && (
          <TouchableOpacity
            style={styles.playOverlay}
            onPress={togglePlayback}
            activeOpacity={1}
          >
            <Ionicons name="play-circle" size={80} color="#FFFFFF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Info Overlay */}
      {!showComments && !showChat && showControls && (
        <Animated.View
          style={[styles.infoOverlay, { opacity: controlsOpacity }]}
        >
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{hotTake.title}</Text>
            {trendingLabel && (
              <TrendingBadge label={trendingLabel} />
            )}
          </View>
          <Text style={styles.meta}>
            @{hotTake.author.username} • {hotTake.venueName || 'Unknown Venue'}
          </Text>

          {/* Live Reaction Bar */}
          <LiveReactionBar
            takeId={hotTake.id}
            gameId={hotTake.id}
            onReact={handleReaction}
            reactionCounts={reactionCounts}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Ionicons
                  name={isLiked ? 'heart' : 'heart-outline'}
                  size={32}
                  color={isLiked ? '#FF1493' : '#FFFFFF'}
                />
              </Animated.View>
              <Text style={styles.actionText}>
                {likeCount > 0 ? likeCount : 'Like'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowComments(true)}
            >
              <Ionicons name="chatbubble-outline" size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>
                {comments.length > 0 ? comments.length : 'Comment'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowChat(true)}
            >
              <Ionicons name="people-outline" size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Live Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Floating Emojis */}
      <FloatingEmojiContainer emojis={floatingEmojis} />

      {/* Live Chat Room */}
      {showChat && (
        <View style={styles.chatOverlay}>
          <LiveChatRoom
            gameId={hotTake.id}
            onSendMessage={handleSendChatMessage}
            messages={chatMessages}
            onClose={() => setShowChat(false)}
          />
        </View>
      )}

      {/* Comments Section */}
      {showComments && (
        <KeyboardAvoidingView
          style={styles.commentsContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.commentsHeader}>
            <Text style={styles.commentsTitle}>
              Comments ({comments.length})
            </Text>
            <TouchableOpacity onPress={() => setShowComments(false)}>
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.commentsList}>
            {comments.length === 0 ? (
              <View style={styles.emptyComments}>
                <Ionicons name="chatbubble-outline" size={48} color="#8892A6" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment!</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <View key={comment.id} style={styles.comment}>
                  <View style={styles.commentAvatar}>
                    <Ionicons name="person" size={16} color="#00FF9F" />
                  </View>
                  <View style={styles.commentContent}>
                    <Text style={styles.commentUsername}>
                      @{comment.author.username}
                    </Text>
                    <Text style={styles.commentText}>{comment.body}</Text>
                    <Text style={styles.commentDate}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#8892A6"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Ionicons name="hourglass" size={20} color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 22,
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  videoControls: {
    position: 'absolute',
    bottom: 180,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF9F',
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  chatOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '80%',
    backgroundColor: '#0A0E27',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  meta: {
    fontSize: 14,
    color: '#B8C5D6',
    marginBottom: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.6,
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3A4166',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  commentsList: {
    flex: 1,
    padding: 20,
  },
  emptyComments: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8892A6',
    marginTop: 8,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 12,
    color: '#8892A6',
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3A4166',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    backgroundColor: '#0A0E27',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3A4166',
    opacity: 0.5,
  },
});
