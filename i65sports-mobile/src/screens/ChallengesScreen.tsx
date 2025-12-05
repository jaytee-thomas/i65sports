import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';

const API_URL = 'http://192.168.86.226:3000/api';

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  requirement: string;
  reward: string;
  expiresAt: string | null;
  completions: any[];
}

export default function ChallengesScreen() {
  const { getToken } = useAuth();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/challenges`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChallenges(response.data.challenges);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    try {
      setCompleting(challengeId);
      const token = await getToken();
      await axios.post(
        `${API_URL}/challenges/${challengeId}/complete`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchChallenges();
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00FF9F" />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Fan Challenges</Text>
        <Text style={styles.subtitle}>Complete challenges to earn rewards!</Text>

        <View style={styles.challengesList}>
          {challenges.map((challenge) => {
            const isCompleted = challenge.completions && challenge.completions.length > 0;
            const isExpired =
              challenge.expiresAt && new Date(challenge.expiresAt) < new Date();

            return (
              <View
                key={challenge.id}
                style={[
                  styles.challengeCard,
                  isCompleted && styles.challengeCardCompleted,
                ]}
              >
                <View style={styles.challengeHeader}>
                  <Text style={styles.challengeType}>
                    {getChallengeIcon(challenge.type)}
                  </Text>
                  <View style={styles.challengeHeaderText}>
                    <Text style={styles.challengeTitle}>{challenge.title}</Text>
                    {challenge.expiresAt && (
                      <Text style={styles.expiryText}>
                        {isExpired
                          ? 'Expired'
                          : `Ends ${new Date(challenge.expiresAt).toLocaleDateString()}`}
                      </Text>
                    )}
                  </View>
                </View>

                <Text style={styles.challengeDescription}>
                  {challenge.description}
                </Text>

                <View style={styles.requirementContainer}>
                  <Text style={styles.requirementLabel}>Requirement:</Text>
                  <Text style={styles.requirementText}>{challenge.requirement}</Text>
                </View>

                <View style={styles.rewardContainer}>
                  <Text style={styles.rewardLabel}>Reward:</Text>
                  <Text style={styles.rewardText}>{challenge.reward}</Text>
                </View>

                {isCompleted ? (
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedText}>✓ Completed</Text>
                  </View>
                ) : isExpired ? (
                  <View style={styles.expiredBadge}>
                    <Text style={styles.expiredText}>Expired</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteChallenge(challenge.id)}
                    disabled={completing === challenge.id}
                  >
                    <Text style={styles.completeButtonText}>
                      {completing === challenge.id ? 'Completing...' : 'Complete'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })}
        </View>

        {challenges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No active challenges right now</Text>
            <Text style={styles.emptyStateSubtext}>Check back soon for new challenges!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function getChallengeIcon(type: string): string {
  switch (type) {
    case 'POSTING':
      return '📹';
    case 'ENGAGEMENT':
      return '💬';
    case 'VIEWING':
      return '👁️';
    case 'CREATIVE':
      return '🎨';
    default:
      return '🏆';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0E27',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#8892A6',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#8892A6',
    marginBottom: 24,
  },
  challengesList: {
    gap: 16,
  },
  challengeCard: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#00FF9F',
  },
  challengeCardCompleted: {
    borderColor: '#10B981',
    opacity: 0.7,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  challengeType: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeHeaderText: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  expiryText: {
    fontSize: 12,
    color: '#8892A6',
  },
  challengeDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 20,
  },
  requirementContainer: {
    backgroundColor: '#3A2F1F',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  requirementLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#F59E0B',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 14,
    color: '#FCD34D',
  },
  rewardContainer: {
    backgroundColor: '#1A3A2F',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginBottom: 4,
  },
  rewardText: {
    fontSize: 14,
    color: '#34D399',
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: '#00FF9F',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  completeButtonText: {
    color: '#0A0E27',
    fontWeight: 'bold',
    fontSize: 16,
  },
  completedBadge: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  completedText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  expiredBadge: {
    backgroundColor: '#4A5568',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  expiredText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8892A6',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#4A5568',
  },
});

