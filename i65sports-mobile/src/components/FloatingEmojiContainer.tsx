import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { FloatingEmoji } from './FloatingEmoji';

const { width } = Dimensions.get('window');

interface EmojiData {
  id: string;
  emoji: string;
  x: number;
}

interface FloatingEmojiContainerProps {
  emojis: Array<{ emoji: string; timestamp: number }>;
}

export const FloatingEmojiContainer: React.FC<FloatingEmojiContainerProps> = ({
  emojis,
}) => {
  const [activeEmojis, setActiveEmojis] = useState<EmojiData[]>([]);

  useEffect(() => {
    if (emojis.length > 0) {
      const latest = emojis[emojis.length - 1];
      const newEmoji: EmojiData = {
        id: `${latest.timestamp}-${Math.random()}`,
        emoji: latest.emoji,
        x: Math.random() * (width - 60) + 30, // Random x position
      };

      setActiveEmojis((prev) => [...prev, newEmoji]);
    }
  }, [emojis]);

  const handleComplete = (id: string) => {
    setActiveEmojis((prev) => prev.filter((e) => e.id !== id));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {activeEmojis.map((emojiData) => (
        <View
          key={emojiData.id}
          style={[styles.emojiWrapper, { left: emojiData.x }]}
        >
          <FloatingEmoji
            emoji={emojiData.emoji}
            onComplete={() => handleComplete(emojiData.id)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  emojiWrapper: {
    position: 'absolute',
    bottom: 0,
  },
});

