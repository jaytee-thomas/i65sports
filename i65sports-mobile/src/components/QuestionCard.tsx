import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface QuestionCardProps {
  questionId: string;
  onAnswerSubmit?: () => void;
}

interface Answer {
  id: string;
  text: string;
  createdAt: string;
  User: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
}

interface QuestionData {
  id: string;
  text: string;
  createdAt: string;
  totalAnswers: number;
  answers: Answer[];
  userAnswer: Answer | null;
}

// Simple time formatter (fallback if date-fns not available)
const formatDistanceToNow = (date: Date) => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export default function QuestionCard({ questionId, onAnswerSubmit }: QuestionCardProps) {
  const { getToken } = useAuth();
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    loadQuestion();
  }, [questionId]);

  const loadQuestion = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/questions/${questionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setQuestion(response.data.question);
      
      // Pre-fill answer if user already answered
      if (response.data.question.userAnswer) {
        setAnswerText(response.data.question.userAnswer.text);
      }
    } catch (error) {
      console.error('Error loading question:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim() || submitting) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      await axios.post(
        `${API_URL}/questions/${questionId}/answer`,
        { text: answerText.trim() },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reload question to get updated answers
      await loadQuestion();
      setShowInput(false);
      onAnswerSubmit?.();
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderAnswer = ({ item }: { item: Answer }) => (
    <View style={styles.answerItem}>
      <View style={styles.answerHeader}>
        <Text style={styles.answerUsername}>@{item.User.username}</Text>
        <Text style={styles.answerTime}>
          {formatDistanceToNow(new Date(item.createdAt))}
        </Text>
      </View>
      <Text style={styles.answerText}>{item.text}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00FF9F" />
      </View>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Question Header */}
      <View style={styles.header}>
        <Ionicons name="help-circle" size={20} color="#00FF9F" />
        <Text style={styles.questionText}>{question.text}</Text>
      </View>

      {/* Answer Input */}
      {!question.userAnswer || showInput ? (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your answer..."
            placeholderTextColor="#8892A6"
            value={answerText}
            onChangeText={setAnswerText}
            multiline
            maxLength={500}
          />
          <View style={styles.inputFooter}>
            <Text style={styles.charCount}>{answerText.length}/500</Text>
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!answerText.trim() || submitting) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmitAnswer}
              disabled={!answerText.trim() || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>
                    {question.userAnswer ? 'Update' : 'Submit'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => setShowInput(true)}
        >
          <Ionicons name="create-outline" size={16} color="#00FF9F" />
          <Text style={styles.editButtonText}>Edit your answer</Text>
        </TouchableOpacity>
      )}

      {/* Answers List */}
      <View style={styles.answersContainer}>
        <Text style={styles.answersHeader}>
          {question.totalAnswers} {question.totalAnswers === 1 ? 'Answer' : 'Answers'}
        </Text>
        {question.answers.length > 0 ? (
          <FlatList
            data={question.answers}
            renderItem={renderAnswer}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        ) : (
          <Text style={styles.noAnswers}>Be the first to answer!</Text>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  questionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#8892A6',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#00FF9F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  submitButtonDisabled: {
    backgroundColor: '#1A1F3A',
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    marginBottom: 16,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  answersContainer: {
    borderTopWidth: 1,
    borderTopColor: '#0A0E27',
    paddingTop: 16,
  },
  answersHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
    marginBottom: 12,
  },
  answerItem: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  answerUsername: {
    fontSize: 13,
    fontWeight: '600',
    color: '#00FF9F',
  },
  answerTime: {
    fontSize: 11,
    color: '#8892A6',
  },
  answerText: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  noAnswers: {
    fontSize: 14,
    color: '#8892A6',
    textAlign: 'center',
    paddingVertical: 16,
  },
});
