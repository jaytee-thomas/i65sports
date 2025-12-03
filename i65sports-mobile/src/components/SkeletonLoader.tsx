import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width: skeletonWidth = '100%',
  height = 20,
  borderRadius = 4,
  style,
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: skeletonWidth,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Keep Skeleton for backward compatibility
export const Skeleton = SkeletonLoader;

export const HotTakeCardSkeleton: React.FC = () => (
  <View style={styles.cardSkeleton}>
    {/* Header */}
    <View style={styles.headerSkeleton}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <View style={styles.headerTextSkeleton}>
        <SkeletonLoader width="60%" height={16} />
        <SkeletonLoader width="40%" height={12} style={{ marginTop: 4 }} />
      </View>
    </View>

    {/* Video Thumbnail */}
    <SkeletonLoader width="100%" height={400} borderRadius={12} style={{ marginTop: 12 }} />

    {/* Actions */}
    <View style={styles.actionsSkeleton}>
      <SkeletonLoader width={80} height={32} borderRadius={16} />
      <SkeletonLoader width={80} height={32} borderRadius={16} />
      <SkeletonLoader width={80} height={32} borderRadius={16} />
    </View>

    {/* Title */}
    <SkeletonLoader width="90%" height={18} style={{ marginTop: 12 }} />
    <SkeletonLoader width="70%" height={14} style={{ marginTop: 6 }} />
  </View>
);

export const ProfileHeaderSkeleton: React.FC = () => (
  <View style={styles.profileSkeleton}>
    {/* Avatar */}
    <SkeletonLoader width={100} height={100} borderRadius={50} style={{ alignSelf: 'center' }} />
    
    {/* Username */}
    <SkeletonLoader width="50%" height={24} style={{ alignSelf: 'center', marginTop: 16 }} />
    
    {/* Bio */}
    <SkeletonLoader width="80%" height={14} style={{ alignSelf: 'center', marginTop: 8 }} />
    <SkeletonLoader width="60%" height={14} style={{ alignSelf: 'center', marginTop: 4 }} />
    
    {/* Stats */}
    <View style={styles.statsSkeleton}>
      <SkeletonLoader width={60} height={40} />
      <SkeletonLoader width={60} height={40} />
      <SkeletonLoader width={60} height={40} />
    </View>
  </View>
);

export const NotificationSkeleton: React.FC = () => (
  <View style={styles.notificationSkeleton}>
    <SkeletonLoader width={48} height={48} borderRadius={24} />
    <View style={styles.notificationTextSkeleton}>
      <SkeletonLoader width="80%" height={14} />
      <SkeletonLoader width="40%" height={12} style={{ marginTop: 6 }} />
    </View>
  </View>
);

// Keep ProfileGridSkeleton for backward compatibility with ProfileScreen
export const ProfileGridSkeleton: React.FC = () => (
  <View style={styles.gridRow}>
    {[1, 2, 3].map((i) => (
      <SkeletonLoader
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
  skeleton: {
    backgroundColor: '#1A1F3A',
  },
  cardSkeleton: {
    backgroundColor: '#0A0E27',
    padding: 16,
    marginBottom: 16,
  },
  headerSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextSkeleton: {
    marginLeft: 12,
    flex: 1,
  },
  actionsSkeleton: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  profileSkeleton: {
    padding: 20,
  },
  statsSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  notificationSkeleton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  notificationTextSkeleton: {
    flex: 1,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
});
