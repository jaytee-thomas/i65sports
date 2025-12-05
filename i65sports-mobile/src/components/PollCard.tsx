import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface PollCardProps {
  pollId: string;
  onVoteComplete?: () => void;
}

interface PollResult {
  option: string;
  votes: number;
  percentage: number;
}

interface PollData {
  id: string;
  question: string;
  options: string[];
  expiresAt: string | null;
  totalVotes: number;
  results: PollResult[];
  userVote: number | null;
}

export default function PollCard({ pollId, onVoteComplete }: PollCardProps) {
  const { getToken } = useAuth();
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    loadPoll();
  }, [pollId]);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/polls/${pollId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPoll(response.data.poll);
    } catch (error) {
      console.error('Error loading poll:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (optionIndex: number) => {
    if (voting || !poll) return;

    try {
      setVoting(true);
      const token = await getToken();
      await axios.post(
        `${API_URL}/polls/${pollId}/vote`,
        { optionIndex },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reload poll to get updated results
      await loadPoll();
      onVoteComplete?.();
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00FF9F" />
      </View>
    );
  }

  if (!poll) {
    return null;
  }

  const isExpired = poll.expiresAt && new Date(poll.expiresAt) < new Date();
  const hasVoted = poll.userVote !== null;

  return (
    <View style={styles.container}>
      {/* Poll Question */}
      <View style={styles.header}>
        <Ionicons name="stats-chart" size={20} color="#00FF9F" />
        <Text style={styles.question}>{poll.question}</Text>
      </View>

      {/* Poll Options */}
      <View style={styles.optionsContainer}>
        {poll.options.map((option, index) => {
          const result = poll.results[index];
          const isSelected = poll.userVote === index;
          const showResults = hasVoted || isExpired;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                showResults && styles.resultOption,
              ]}
              onPress={() => !hasVoted && !isExpired && handleVote(index)}
              disabled={hasVoted || isExpired || voting}
            >
              {/* Progress bar background */}
              {showResults && (
                <View
                  style={[
                    styles.progressBar,
                    { width: `${result.percentage}%` },
                    isSelected && styles.selectedProgressBar,
                  ]}
                />
              )}

              {/* Option content */}
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#00FF9F" />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </View>

                {showResults && (
                  <Text
                    style={[
                      styles.percentage,
                      isSelected && styles.selectedPercentage,
                    ]}
                  >
                    {result.percentage}%
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Poll Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {poll.totalVotes} {poll.totalVotes === 1 ? 'vote' : 'votes'}
        </Text>
        {isExpired && <Text style={styles.expiredText}>Poll ended</Text>}
        {poll.expiresAt && !isExpired && (
          <Text style={styles.expiresText}>
            Expires {new Date(poll.expiresAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </View>
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
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    backgroundColor: '#0A0E27',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
    minHeight: 44,
    justifyContent: 'center',
  },
  selectedOption: {
    borderColor: '#00FF9F',
  },
  resultOption: {
    backgroundColor: '#0A0E27',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
  },
  selectedProgressBar: {
    backgroundColor: 'rgba(0, 255, 159, 0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    zIndex: 1,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  optionText: {
    fontSize: 14,
    color: '#B8C5D6',
    flex: 1,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8892A6',
  },
  selectedPercentage: {
    color: '#00FF9F',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0A0E27',
  },
  footerText: {
    fontSize: 12,
    color: '#8892A6',
  },
  expiredText: {
    fontSize: 12,
    color: '#FF4444',
    fontWeight: '600',
  },
  expiresText: {
    fontSize: 12,
    color: '#8892A6',
  },
});
