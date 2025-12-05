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

interface ChallengeCardProps {
  challengeId: string;
  onJoin?: () => void;
}

interface ChallengeData {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward: string;
  expiresAt: string | null;
  createdAt: string;
  totalParticipants: number;
  completedCount: number;
  userProgress: {
    progress: number;
    completed: boolean;
    completedAt: string | null;
  } | null;
}

export default function ChallengeCard({ challengeId, onJoin }: ChallengeCardProps) {
  const { getToken } = useAuth();
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadChallenge();
  }, [challengeId]);

  const loadChallenge = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/challenges/${challengeId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenge(response.data.challenge);
    } catch (error) {
      console.error('Error loading challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (joining || !challenge) return;

    try {
      setJoining(true);
      const token = await getToken();
      await axios.post(
        `${API_URL}/challenges/${challengeId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reload challenge to get updated status
      await loadChallenge();
      onJoin?.();
    } catch (error) {
      console.error('Error joining challenge:', error);
    } finally {
      setJoining(false);
    }
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00FF9F" />
      </View>
    );
  }

  if (!challenge) {
    return null;
  }

  const hasJoined = challenge.userProgress !== null;
  const isCompleted = challenge.userProgress?.completed || false;
  const progress = challenge.userProgress?.progress || 0;
  const progressPercentage = Math.min((progress / challenge.target) * 100, 100);
  const isExpired = challenge.expiresAt && new Date(challenge.expiresAt) < new Date();

  // Get challenge icon based on type
  const getChallengeIcon = () => {
    switch (challenge.type) {
      case 'POSTING':
        return 'film';
      case 'ENGAGEMENT':
        return 'flame';
      case 'VIEWING':
        return 'eye';
      case 'CREATIVE':
        return 'brush';
      default:
        return 'trophy';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name={getChallengeIcon()} size={24} color="#FF6B35" />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.title}>{challenge.title}</Text>
          {challenge.description && (
            <Text style={styles.description}>{challenge.description}</Text>
          )}
        </View>
      </View>

      {/* Status Badge */}
      {isCompleted ? (
        <View style={[styles.badge, styles.completedBadge]}>
          <Ionicons name="checkmark-circle" size={16} color="#00FF9F" />
          <Text style={styles.badgeText}>Completed!</Text>
        </View>
      ) : isExpired ? (
        <View style={[styles.badge, styles.expiredBadge]}>
          <Ionicons name="close-circle" size={16} color="#8892A6" />
          <Text style={styles.badgeText}>Expired</Text>
        </View>
      ) : challenge.expiresAt ? (
        <View style={[styles.badge, styles.activeBadge]}>
          <Ionicons name="time" size={16} color="#FF9500" />
          <Text style={styles.badgeText}>
            {getTimeSince(challenge.expiresAt)}
          </Text>
        </View>
      ) : null}

      {/* Progress (if joined) */}
      {hasJoined && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {progress} / {challenge.target}
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progressPercentage}%` }]} />
          </View>
        </View>
      )}

      {/* Reward */}
      <View style={styles.rewardContainer}>
        <Ionicons name="gift" size={16} color="#FFD700" />
        <Text style={styles.rewardText}>Reward: {challenge.reward}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Ionicons name="people" size={16} color="#8892A6" />
          <Text style={styles.statText}>{challenge.totalParticipants} joined</Text>
        </View>
        <View style={styles.stat}>
          <Ionicons name="checkmark-done" size={16} color="#8892A6" />
          <Text style={styles.statText}>{challenge.completedCount} completed</Text>
        </View>
      </View>

      {/* Action Button */}
      {!hasJoined && !isExpired && (
        <TouchableOpacity
          style={[styles.joinButton, joining && styles.joinButtonDisabled]}
          onPress={handleJoin}
          disabled={joining}
        >
          {joining ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color="#FFFFFF" />
              <Text style={styles.joinButtonText}>Join Challenge</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {isCompleted && (
        <View style={styles.completedContainer}>
          <Ionicons name="trophy" size={32} color="#FFD700" />
          <Text style={styles.completedText}>Challenge Completed!</Text>
          <Text style={styles.completedSubtext}>
            You earned: {challenge.reward}
          </Text>
        </View>
      )}
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
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#B8C5D6',
    lineHeight: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  activeBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  completedBadge: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 159, 0.3)',
  },
  expiredBadge: {
    backgroundColor: 'rgba(136, 146, 166, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(136, 146, 166, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF9F',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#0A0E27',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#00FF9F',
    borderRadius: 4,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 8,
  },
  rewardText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFD700',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#0A0E27',
    marginBottom: 12,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#8892A6',
  },
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF6B35',
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonDisabled: {
    opacity: 0.5,
  },
  joinButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  completedContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  completedText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00FF9F',
    marginTop: 8,
  },
  completedSubtext: {
    fontSize: 14,
    color: '#FFD700',
    marginTop: 4,
  },
});

