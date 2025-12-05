import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useAuth } from '@clerk/clerk-expo';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import PollCard from '../components/PollCard';
import QuestionCard from '../components/QuestionCard';
import PredictionCard from '../components/PredictionCard';
import ChallengeCard from '../components/ChallengeCard';

const API_URL = 'http://192.168.86.226:3000/api';

type RouteParams = {
  HotTakeDetail: {
    hotTake: {
      id: string;
      title: string;
      description?: string;
      videoUrl: string;
      thumbnailUrl?: string;
      author: {
        id: string;
        username: string;
        avatarUrl?: string;
      };
      createdAt: string;
      _count?: {
        reactions: number;
        comments: number;
      };
    };
  };
};

export default function HotTakeDetailScreen() {
  const route = useRoute<RouteProp<RouteParams, 'HotTakeDetail'>>();
  const navigation = useNavigation<any>();
  const { hotTake } = route.params;
  const { getToken } = useAuth();

  const [isPlaying, setIsPlaying] = useState(true);
  const [hasReacted, setHasReacted] = useState(false);
  const [reactionsCount, setReactionsCount] = useState(hotTake?._count?.reactions || 0);
  const [commentsCount, setCommentsCount] = useState(hotTake?._count?.comments || 0);
  const [loading, setLoading] = useState(false);
  const [pollId, setPollId] = useState<string | null>(null);
  const [questionId, setQuestionId] = useState<string | null>(null);
  const [predictionId, setPredictionId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [loadingPoll, setLoadingPoll] = useState(true);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Safety check for hotTake data
  if (!hotTake) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load hot take details</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Safety check for author data
  const author = hotTake.author || { id: '', username: 'Unknown', avatarUrl: undefined };

  useEffect(() => {
    checkReactionStatus();
    checkForEngagementTools();
    loadComments();
  }, []);

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const checkReactionStatus = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/hot-takes/${hotTake.id}/reactions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data) {
        setHasReacted(response.data.hasReacted || false);
        setReactionsCount(response.data.reactionCount || 0);
      }
    } catch (error) {
      console.error('Failed to check reaction status:', error);
    }
  };

  const checkForEngagementTools = async () => {
    try {
      setLoadingPoll(true);
      console.log('🔍 Checking for engagement tools on Hot Take:', hotTake.id);
      const token = await getToken();
      console.log('🔑 Got token, calling API...');
      
      const response = await axios.get(
        `${API_URL}/hot-takes/${hotTake.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      console.log('📊 Hot Take API response:', JSON.stringify(response.data, null, 2));
      
      // Check for poll
      if (response.data?.poll) {
        console.log('✅ Poll found! ID:', response.data.poll.id);
        setPollId(response.data.poll.id);
      } else {
        console.log('❌ No poll found');
      }

      // Check for question
      if (response.data?.question) {
        console.log('✅ Question found! ID:', response.data.question.id);
        setQuestionId(response.data.question.id);
      } else {
        console.log('❌ No question found');
      }

      // Check for prediction
      if (response.data?.prediction) {
        console.log('✅ Prediction found! ID:', response.data.prediction.id);
        setPredictionId(response.data.prediction.id);
      } else {
        console.log('❌ No prediction found');
      }

      // Check for challenge
      if (response.data?.challenge) {
        console.log('✅ Challenge found! ID:', response.data.challenge.id);
        setChallengeId(response.data.challenge.id);
      } else {
        console.log('❌ No challenge found');
      }
    } catch (error) {
      console.error('💥 Failed to check for engagement tools:', error);
    } finally {
      setLoadingPoll(false);
    }
  };

  const loadComments = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(
        `${API_URL}/hot-takes/${hotTake.id}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.data?.comments) {
        setComments(response.data.comments);
      }
    } catch (error) {
      console.error('Failed to load comments:', error);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/hot-takes/${hotTake.id}/comments`,
        {
          body: newComment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data?.comment) {
        setComments((prev) => [response.data.comment, ...prev]);
        setNewComment('');
        setCommentsCount((prev) => prev + 1);
        Toast.show({
          type: 'success',
          text1: 'Comment added',
        });
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to add comment',
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReaction = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.post(
        `${API_URL}/hot-takes/${hotTake.id}/reactions`,
        { type: 'LIKE' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Toggle hasReacted based on response
      if (response.data) {
        setHasReacted(response.data.reacted || false);
        setReactionsCount((prev) => (response.data.reacted ? prev + 1 : Math.max(0, prev - 1)));
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      Alert.alert('Error', 'Failed to update reaction');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentAdded = () => {
    setCommentsCount((prev) => prev + 1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hot Take</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Video */}
        <Video
          source={{ uri: hotTake.videoUrl }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping
          shouldPlay={isPlaying}
        />

        {/* Hot Take Info */}
        <View style={styles.infoSection}>
          <Text style={styles.title}>{hotTake.title}</Text>
          {hotTake.description && (
            <Text style={styles.description}>{hotTake.description}</Text>
          )}

          {/* Author & Date */}
          <View style={styles.metaRow}>
            <Text style={styles.author}>@{author.username}</Text>
            <Text style={styles.date}>
              {getTimeSince(hotTake.createdAt)}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleReaction}
              disabled={loading}
            >
              <Ionicons
                name={hasReacted ? 'heart' : 'heart-outline'}
                size={24}
                color={hasReacted ? '#FF1493' : '#fff'}
              />
              <Text style={styles.actionText}>{reactionsCount}</Text>
            </TouchableOpacity>

            <View style={styles.actionButton}>
              <Ionicons name="chatbubble-outline" size={24} color="#fff" />
              <Text style={styles.actionText}>{commentsCount}</Text>
            </View>
          </View>
        </View>

        {/* Poll (if exists) */}
        {!loadingPoll && pollId && (
          <View style={styles.pollContainer}>
            <PollCard pollId={pollId} />
          </View>
        )}

        {/* Question (if exists) */}
        {!loadingPoll && questionId && (
          <View style={styles.pollContainer}>
            <QuestionCard questionId={questionId} />
          </View>
        )}

        {/* Prediction (if exists) */}
        {!loadingPoll && predictionId && (
          <View style={styles.pollContainer}>
            <PredictionCard predictionId={predictionId} />
          </View>
        )}

        {/* Challenge (if exists) */}
        {!loadingPoll && challengeId && (
          <View style={styles.pollContainer}>
            <ChallengeCard challengeId={challengeId} />
          </View>
        )}

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({commentsCount})</Text>
          
          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="#8892A6"
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, isSubmittingComment && styles.sendButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={isSubmittingComment || !newComment.trim()}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="send" size={20} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>No comments yet</Text>
            </View>
          ) : (
            comments.map((comment) => (
              <View key={comment.id} style={styles.commentItem}>
                <View style={styles.commentAvatar}>
                  <Ionicons name="person" size={20} color="#FFFFFF" />
                </View>
                <View style={styles.commentContent}>
                  <View style={styles.commentHeader}>
                    <Text style={styles.commentAuthor}>
                      @{comment.author?.username || 'Unknown'}
                    </Text>
                    <Text style={styles.commentTime}>
                      {getTimeSince(comment.createdAt)}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>
                    {comment.body || comment.text}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 50,
    backgroundColor: '#0A0E27',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  video: {
    width: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#000',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#0A0E27',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    color: '#B8C5D6',
    fontSize: 14,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  author: {
    color: '#00FF9F',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 12,
  },
  date: {
    color: '#8892A6',
    fontSize: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
  },
  pollContainer: {
    padding: 16,
    backgroundColor: '#0A0E27',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0A0E27',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#00FF9F',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#0A0E27',
    fontSize: 16,
    fontWeight: '600',
  },
  commentsSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
  },
  commentsTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 16,
    gap: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 40,
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
    opacity: 0.5,
  },
  emptyComments: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyCommentsText: {
    color: '#8892A6',
    fontSize: 14,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1A1F3A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  commentAuthor: {
    color: '#00FF9F',
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    color: '#8892A6',
    fontSize: 12,
  },
  commentText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
});
