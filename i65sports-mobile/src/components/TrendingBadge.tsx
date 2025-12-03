import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface TrendingBadgeProps {
  label: string;
  velocity?: number;
}

export const TrendingBadge: React.FC<TrendingBadgeProps> = ({
  label,
  velocity,
}) => {
  if (!label) return null;

  const getColorForLabel = (label: string) => {
    if (label.includes('ON FIRE')) return '#FF4500';
    if (label.includes('TRENDING')) return '#FF1493';
    if (label.includes('Rising')) return '#FFD700';
    return '#00FF9F';
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: getColorForLabel(label) },
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      {velocity && velocity > 5 && (
        <Text style={styles.velocity}>
          {velocity.toFixed(0)}/min
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  velocity: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

