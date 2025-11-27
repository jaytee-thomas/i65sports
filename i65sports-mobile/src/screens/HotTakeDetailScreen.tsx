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
} from 'react-native';
import { Video, ResizeMode, AVPlaybackStatus, AVPlaybackStatusSuccess } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { Share, Alert } from 'react-native';
import axios from 'axios';

const { width, height } = Dimensions.get('window');
const API_URL = 'http://localhost:3000/api'; // For simulator

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
  };
}

export default function HotTakeDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'HotTakeDetail'>>();
  const navigation = useNavigation();
  const { hotTake } = route.params;
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
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

  const userId = 'cmig5amau0000st344d7gkjti';

  useEffect(() => {
    loadLikes();
    loadComments();
  }, []);

  useEffect(() => {
    if (showControls) {
      // Fade in
      Animated.timing(controlsOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      resetControlsTimeout();
    } else {
      // Fade out
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

  const loadLikes = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/hot-takes-public/${hotTake.id}/like?userId=${userId}`
      );
      setLikeCount(response.data.likeCount);
      setIsLiked(response.data.isLiked);
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const loadComments = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/hot-takes-public/${hotTake.id}/comments`
      );
      setComments(response.data.comments);
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
    // Toggle playback
    togglePlayback();
    // Also show controls briefly
    setShowControls(true);
    resetControlsTimeout();
  };

  const handleLike = async () => {
    try {
      const newLiked = !isLiked;
      const newCount = newLiked ? likeCount + 1 : likeCount - 1;
      setIsLiked(newLiked);
      setLikeCount(newCount);

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

      await axios.post(`${API_URL}/hot-takes-public/${hotTake.id}/like`, {
        userId,
      });
    } catch (error) {
      console.error('Error liking:', error);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount + 1 : likeCount - 1);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${API_URL}/hot-takes-public/${hotTake.id}/comments`,
        {
          userId,
          content: newComment.trim(),
        }
      );

      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (error) {
      console.error('Error posting comment:', error);
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
            style={[
              styles.videoControls,
              { opacity: controlsOpacity }
            ]}
          >
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
              <Text style={styles.timeText}>
                {formatTime(position)} / {formatTime(duration)}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Play/Pause Overlay */}
        {showControls && (
          <TouchableOpacity 
            style={styles.playOverlay}
            onPress={togglePlayback}
            activeOpacity={1}
          >
            {!isPlaying && <Ionicons name="play-circle" size={80} color="#FFFFFF" />}
            {isPlaying && <Ionicons name="pause-circle" size={80} color="rgba(255, 255, 255, 0.8)" />}
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Info Overlay */}
      {!showComments && showControls && (
        <Animated.View 
          style={[
            styles.infoOverlay,
            { opacity: controlsOpacity }
          ]}
        >
          <Text style={styles.title}>{hotTake.title}</Text>
          <Text style={styles.meta}>
            @{hotTake.author.username} • {hotTake.venueName || 'Unknown Venue'}
          </Text>

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
              onPress={handleShare}
            >
              <Ionicons name="share-outline" size={32} color="#FFFFFF" />
              <Text style={styles.actionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
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
            {comments.map((comment) => (
              <View key={comment.id} style={styles.comment}>
                <Text style={styles.commentUsername}>
                  @{comment.author.username}
                </Text>
                <Text style={styles.commentContent}>
                  {comment.body || comment.content}
                </Text>
                <Text style={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.commentInput}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor="#8892A6"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!newComment.trim() || isSubmitting) && styles.sendButtonDisabled,
              ]}
              onPress={handleComment}
              disabled={!newComment.trim() || isSubmitting}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
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
    bottom: 180, // Changed from 100 - moves it higher above the footer
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  playPauseButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressContainer: {
    // Removed absolute positioning - now relative to videoControls
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
    backgroundColor: '#FF1493',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    backgroundColor: 'rgba(0, 0, 0, 0.1)', // Lighter so you can see video behind
  },
  infoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
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
  },
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: '#1A1F3A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
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
    padding: 16,
  },
  comment: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A3154',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00FF9F',
    marginBottom: 4,
  },
  commentContent: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: '#8892A6',
  },
  commentInput: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#3A4166',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#2A3154',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    color: '#FFFFFF',
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#3A4166',
  },
});
