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

interface PredictionCardProps {
  predictionId: string;
  onPredictComplete?: () => void;
}

interface PredictionResult {
  option: string;
  predictions: number;
  percentage: number;
  isCorrect?: boolean;
}

interface PredictionData {
  id: string;
  question: string;
  options: string[];
  expiresAt: string;
  resolvedAt: string | null;
  correctOption: number | null;
  totalPredictions: number;
  results: PredictionResult[];
  userPrediction: number | null;
  userWon: boolean;
  isLocked: boolean;
  isResolved: boolean;
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

export default function PredictionCard({ predictionId, onPredictComplete }: PredictionCardProps) {
  const { getToken } = useAuth();
  const [prediction, setPrediction] = useState<PredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    loadPrediction();
  }, [predictionId]);

  const loadPrediction = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/predictions/${predictionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPrediction(response.data.prediction);
    } catch (error) {
      console.error('Error loading prediction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePredict = async (optionIndex: number) => {
    if (predicting || !prediction || prediction.isLocked) return;

    try {
      setPredicting(true);
      const token = await getToken();
      await axios.post(
        `${API_URL}/predictions/${predictionId}/predict`,
        { optionIndex },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Reload prediction to get updated results
      await loadPrediction();
      onPredictComplete?.();
    } catch (error) {
      console.error('Error predicting:', error);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="small" color="#00FF9F" />
      </View>
    );
  }

  if (!prediction) {
    return null;
  }

  const timeUntilExpiry = new Date(prediction.expiresAt).getTime() - Date.now();
  const hasExpired = timeUntilExpiry <= 0;
  const hasPredicted = prediction.userPrediction !== null;
  const showResults = prediction.isLocked || hasPredicted;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Ionicons name="trophy" size={20} color="#FFD700" />
        <Text style={styles.question}>{prediction.question}</Text>
      </View>

      {/* Status Badge */}
      {prediction.isResolved ? (
        <View style={[styles.badge, styles.resolvedBadge]}>
          <Ionicons name="checkmark-circle" size={14} color="#00FF9F" />
          <Text style={styles.badgeText}>Resolved</Text>
        </View>
      ) : prediction.isLocked ? (
        <View style={[styles.badge, styles.lockedBadge]}>
          <Ionicons name="lock-closed" size={14} color="#FF9500" />
          <Text style={styles.badgeText}>Locked</Text>
        </View>
      ) : (
        <View style={[styles.badge, styles.activeBadge]}>
          <Ionicons name="time" size={14} color="#00FF9F" />
          <Text style={styles.badgeText}>
            {formatDistanceToNow(new Date(prediction.expiresAt))} remaining
          </Text>
        </View>
      )}

      {/* Options */}
      <View style={styles.optionsContainer}>
        {prediction.options.map((option, index) => {
          const result = prediction.results[index];
          const isSelected = prediction.userPrediction === index;
          const isCorrect = prediction.isResolved && result.isCorrect;
          const isWrong = prediction.isResolved && isSelected && !isCorrect;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                isCorrect && styles.correctOption,
                isWrong && styles.wrongOption,
                showResults && styles.resultOption,
              ]}
              onPress={() => !prediction.isLocked && handlePredict(index)}
              disabled={prediction.isLocked || predicting}
            >
              {/* Progress bar background */}
              {showResults && (
                <View
                  style={[
                    styles.progressBar,
                    { width: `${result.percentage}%` },
                    isSelected && styles.selectedProgressBar,
                    isCorrect && styles.correctProgressBar,
                  ]}
                />
              )}

              {/* Option content */}
              <View style={styles.optionContent}>
                <View style={styles.optionLeft}>
                  {isCorrect && (
                    <Ionicons name="trophy" size={20} color="#FFD700" />
                  )}
                  {isWrong && (
                    <Ionicons name="close-circle" size={20} color="#FF4444" />
                  )}
                  {!prediction.isResolved && isSelected && (
                    <Ionicons name="checkmark-circle" size={20} color="#00FF9F" />
                  )}
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.selectedOptionText,
                      isCorrect && styles.correctOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </View>

                {showResults && (
                  <View style={styles.optionRight}>
                    <Text
                      style={[
                        styles.percentage,
                        isSelected && styles.selectedPercentage,
                      ]}
                    >
                      {result.percentage}%
                    </Text>
                    <Text style={styles.predictionCount}>
                      {result.predictions}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {prediction.totalPredictions} {prediction.totalPredictions === 1 ? 'prediction' : 'predictions'}
        </Text>
        
        {prediction.isResolved && prediction.userWon && (
          <View style={styles.winBadge}>
            <Ionicons name="trophy" size={14} color="#FFD700" />
            <Text style={styles.winText}>You won +10 points!</Text>
          </View>
        )}
        
        {prediction.isLocked && !prediction.isResolved && (
          <Text style={styles.lockedText}>Waiting for results...</Text>
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
    marginBottom: 12,
  },
  question: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
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
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 159, 0.3)',
  },
  lockedBadge: {
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  resolvedBadge: {
    backgroundColor: 'rgba(0, 255, 159, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 159, 0.3)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B8C5D6',
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
  correctOption: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  wrongOption: {
    borderColor: '#FF4444',
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
  correctProgressBar: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
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
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  correctOptionText: {
    color: '#FFD700',
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
  predictionCount: {
    fontSize: 12,
    color: '#8892A6',
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
  winBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  winText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFD700',
  },
  lockedText: {
    fontSize: 12,
    color: '#FF9500',
    fontWeight: '600',
  },
});
