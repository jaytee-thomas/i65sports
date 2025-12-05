import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PollCreator from './PollCreator';
import QuestionCreator from './QuestionCreator';
import PredictionCreator from './PredictionCreator';
import ChallengeCreator from './ChallengeCreator';

interface EngagementToolsSectionProps {
  onPollChange: (poll: any) => void;
  onQuestionChange: (question: any) => void;
  onPredictionChange: (prediction: any) => void;
  onChallengeChange: (challenge: any) => void;
}

export default function EngagementToolsSection({
  onPollChange,
  onQuestionChange,
  onPredictionChange,
  onChallengeChange,
}: EngagementToolsSectionProps) {
  const [showPoll, setShowPoll] = useState(false);
  const [showQuestion, setShowQuestion] = useState(false);
  const [showPrediction, setShowPrediction] = useState(false);
  const [showChallenge, setShowChallenge] = useState(false);

  const handleTogglePoll = () => {
    const newState = !showPoll;
    setShowPoll(newState);
    if (!newState) {
      onPollChange(null);
    }
  };

  const handleToggleQuestion = () => {
    const newState = !showQuestion;
    setShowQuestion(newState);
    if (!newState) {
      onQuestionChange(null);
    }
  };

  const handleTogglePrediction = () => {
    const newState = !showPrediction;
    setShowPrediction(newState);
    if (!newState) {
      onPredictionChange(null);
    }
  };

  const handleToggleChallenge = () => {
    const newState = !showChallenge;
    setShowChallenge(newState);
    if (!newState) {
      onChallengeChange(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Add Engagement Tools (Optional)</Text>

      {/* Tool Toggles */}
      <View style={styles.togglesContainer}>
        <TouchableOpacity
          style={[styles.toggleButton, showPoll && styles.toggleButtonActive]}
          onPress={handleTogglePoll}
        >
          <Ionicons
            name="bar-chart"
            size={20}
            color={showPoll ? '#00FF9F' : '#8892A6'}
          />
          <Text style={[styles.toggleText, showPoll && styles.toggleTextActive]}>
            Poll
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showQuestion && styles.toggleButtonActive]}
          onPress={handleToggleQuestion}
        >
          <Ionicons
            name="help-circle"
            size={20}
            color={showQuestion ? '#00FF9F' : '#8892A6'}
          />
          <Text style={[styles.toggleText, showQuestion && styles.toggleTextActive]}>
            Question
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showPrediction && styles.toggleButtonActive]}
          onPress={handleTogglePrediction}
        >
          <Ionicons
            name="trophy"
            size={20}
            color={showPrediction ? '#FFD700' : '#8892A6'}
          />
          <Text style={[styles.toggleText, showPrediction && styles.toggleTextActive]}>
            Prediction
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.toggleButton, showChallenge && styles.toggleButtonActive]}
          onPress={handleToggleChallenge}
        >
          <Ionicons
            name="flame"
            size={20}
            color={showChallenge ? '#FF6B35' : '#8892A6'}
          />
          <Text style={[styles.toggleText, showChallenge && styles.toggleTextActive]}>
            Challenge
          </Text>
        </TouchableOpacity>
      </View>

      {/* Creator Forms */}
      <ScrollView style={styles.creatorsContainer}>
        {showPoll && <PollCreator onChange={onPollChange} />}
        {showQuestion && <QuestionCreator onChange={onQuestionChange} />}
        {showPrediction && <PredictionCreator onChange={onPredictionChange} />}
        {showChallenge && <ChallengeCreator onChange={onChallengeChange} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  togglesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#1A1F3A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleButtonActive: {
    borderColor: '#00FF9F',
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8892A6',
  },
  toggleTextActive: {
    color: '#00FF9F',
  },
  creatorsContainer: {
    maxHeight: 400,
  },
});

