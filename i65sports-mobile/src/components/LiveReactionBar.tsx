import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface LiveReactionBarProps {
  takeId: string;
  gameId: string;
  onReact: (emoji: string) => void;
  reactionCounts: { [emoji: string]: number };
}

const EMOJIS = [
  { emoji: '🔥', name: 'fire', color: '#FF4500' },
  { emoji: '💯', name: 'hundred', color: '#FFD700' },
  { emoji: '😱', name: 'shocked', color: '#FF69B4' },
  { emoji: '🎉', name: 'party', color: '#00FF9F' },
  { emoji: '👀', name: 'eyes', color: '#87CEEB' },
  { emoji: '💪', name: 'strong', color: '#FFA500' },
];

export const LiveReactionBar: React.FC<LiveReactionBarProps> = ({
  takeId,
  gameId,
  onReact,
  reactionCounts,
}) => {
  const [selectedEmoji, setSelectedEmoji] = useState<string | null>(null);
  const scaleAnims = EMOJIS.map(() => new Animated.Value(1));

  const handleReact = (emoji: string, index: number) => {
    setSelectedEmoji(emoji);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnims[index], {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnims[index], {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onReact(emoji);

    // Reset selection after animation
    setTimeout(() => setSelectedEmoji(null), 300);
  };

  return (
    <View style={styles.container}>
      <View style={styles.emojiRow}>
        {EMOJIS.map((item, index) => {
          const count = reactionCounts[item.emoji] || 0;
          const isSelected = selectedEmoji === item.emoji;

          return (
            <TouchableOpacity
              key={item.emoji}
              style={[
                styles.emojiButton,
                isSelected && styles.emojiButtonSelected,
              ]}
              onPress={() => handleReact(item.emoji, index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={{
                  transform: [{ scale: scaleAnims[index] }],
                }}
              >
                <Text style={styles.emoji}>{item.emoji}</Text>
              </Animated.View>
              {count > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>
                    {count > 999 ? '999+' : count}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0A0E27',
    borderTopWidth: 1,
    borderTopColor: '#1A1F3A',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  emojiButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1A1F3A',
    position: 'relative',
  },
  emojiButtonSelected: {
    backgroundColor: '#00FF9F',
  },
  emoji: {
    fontSize: 28,
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF1493',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  countText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

