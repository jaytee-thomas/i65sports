import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}

export const Skeleton = ({ width, height, borderRadius = 8, style }: SkeletonProps) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: '#2A3154',
          opacity,
        },
        style,
      ]}
    />
  );
};

export const HotTakeCardSkeleton = () => (
  <View style={styles.card}>
    <Skeleton width="100%" height={200} borderRadius={12} />
    <View style={styles.cardInfo}>
      <Skeleton width="60%" height={20} />
      <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
      <Skeleton width="30%" height={12} style={{ marginTop: 4 }} />
    </View>
  </View>
);

export const ProfileGridSkeleton = () => (
  <View style={styles.gridRow}>
    {[1, 2, 3].map((i) => (
      <Skeleton
        key={i}
        width={(100 - 8) / 3 + '%'}
        height={120}
        borderRadius={4}
        style={{ margin: 2 }}
      />
    ))}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1A1F3A',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A4166',
    overflow: 'hidden',
  },
  cardInfo: {
    padding: 12,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});

