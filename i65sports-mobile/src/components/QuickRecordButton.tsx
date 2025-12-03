import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickRecordButtonProps {
  onPress: () => void;
  gameClock?: string;
}

export const QuickRecordButton: React.FC<QuickRecordButtonProps> = ({
  onPress,
  gameClock,
}) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <View style={styles.recordIcon}>
          <View style={styles.recordDot} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.mainText}>Record NOW</Text>
          {gameClock && (
            <Text style={styles.clockText}>{gameClock}</Text>
          )}
        </View>
        <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF1493',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#FF1493',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  recordIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recordDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  textContainer: {
    flex: 1,
  },
  mainText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  clockText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
});

