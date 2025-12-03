import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { LineChart, BarChart } from 'react-native-chart-kit';

const API_URL = 'http://192.168.86.226:3000/api';
const { width } = Dimensions.get('window');

interface Analytics {
  overview: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    totalFollowers: number;
    engagementRate: number;
  };
  growth: {
    viewsGrowth: number;
    followersGrowth: number;
  };
  topHotTakes: Array<{
    id: string;
    title: string;
    views: number;
    likes: number;
    comments: number;
  }>;
  weeklyData: {
    labels: string[];
    views: number[];
    likes: number[];
  };
}

export default function AnalyticsScreen() {
  const { getToken } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const token = await getToken();
      const response = await axios.get(`${API_URL}/analytics`, {
        params: { range: timeRange },
        headers: { Authorization: `Bearer ${token}` },
      });

      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to load analytics',
        position: 'bottom',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStatCard = (
    icon: string,
    label: string,
    value: number | string,
    growth?: number,
    color: string = '#00FF9F'
  ) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <View style={styles.statInfo}>
        <Text style={styles.statLabel}>{label}</Text>
        <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
        {growth !== undefined && (
          <View style={styles.growth}>
            <Ionicons
              name={growth >= 0 ? 'trending-up' : 'trending-down'}
              size={14}
              color={growth >= 0 ? '#00FF9F' : '#FF6B6B'}
            />
            <Text style={[
              styles.growthText,
              { color: growth >= 0 ? '#00FF9F' : '#FF6B6B' }
            ]}>
              {Math.abs(growth)}%
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#00FF9F" />
        </View>
      </SafeAreaView>
    );
  }

  if (!analytics) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No analytics data available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const chartConfig = {
    backgroundColor: '#1A1F3A',
    backgroundGradientFrom: '#1A1F3A',
    backgroundGradientTo: '#1A1F3A',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(0, 255, 159, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(184, 197, 214, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '4',
      strokeWidth: '2',
      stroke: '#00FF9F',
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Analytics</Text>
          <View style={styles.timeRangeSelector}>
            {(['7d', '30d', '90d'] as const).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeText,
                    timeRange === range && styles.timeRangeTextActive,
                  ]}
                >
                  {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Overview Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {renderStatCard(
              'eye',
              'Total Views',
              analytics.overview.totalViews,
              analytics.growth.viewsGrowth,
              '#00A8E8'
            )}
            {renderStatCard(
              'heart',
              'Total Likes',
              analytics.overview.totalLikes,
              undefined,
              '#FF1493'
            )}
            {renderStatCard(
              'chatbubble',
              'Comments',
              analytics.overview.totalComments,
              undefined,
              '#00FF9F'
            )}
            {renderStatCard(
              'people',
              'Followers',
              analytics.overview.totalFollowers,
              analytics.growth.followersGrowth,
              '#FFB800'
            )}
          </View>

          <View style={styles.engagementCard}>
            <Text style={styles.engagementLabel}>Engagement Rate</Text>
            <Text style={styles.engagementValue}>
              {analytics.overview.engagementRate.toFixed(1)}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min(analytics.overview.engagementRate, 100)}%` },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Views Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Views Over Time</Text>
          <LineChart
            data={{
              labels: analytics.weeklyData.labels,
              datasets: [{ data: analytics.weeklyData.views }],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Likes Chart */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Likes Over Time</Text>
          <BarChart
            data={{
              labels: analytics.weeklyData.labels,
              datasets: [{ data: analytics.weeklyData.likes }],
            }}
            width={width - 32}
            height={220}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisLabel=""
            yAxisSuffix=""
          />
        </View>

        {/* Top Hot Takes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Performing Hot Takes</Text>
          {analytics.topHotTakes.map((hotTake, index) => (
            <View key={hotTake.id} style={styles.topTakeCard}>
              <View style={styles.topTakeRank}>
                <Text style={styles.rankText}>#{index + 1}</Text>
              </View>
              <View style={styles.topTakeInfo}>
                <Text style={styles.topTakeTitle} numberOfLines={1}>
                  {hotTake.title || 'Untitled Hot Take'}
                </Text>
                <View style={styles.topTakeStats}>
                  <View style={styles.topTakeStat}>
                    <Ionicons name="eye" size={14} color="#00A8E8" />
                    <Text style={styles.topTakeStatText}>{hotTake.views}</Text>
                  </View>
                  <View style={styles.topTakeStat}>
                    <Ionicons name="heart" size={14} color="#FF1493" />
                    <Text style={styles.topTakeStatText}>{hotTake.likes}</Text>
                  </View>
                  <View style={styles.topTakeStat}>
                    <Ionicons name="chatbubble" size={14} color="#00FF9F" />
                    <Text style={styles.topTakeStatText}>{hotTake.comments}</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0E27',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#B8C5D6',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  timeRangeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#1A1F3A',
    borderWidth: 1,
    borderColor: '#3A4166',
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: '#00FF9F',
    borderColor: '#00FF9F',
  },
  timeRangeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B8C5D6',
  },
  timeRangeTextActive: {
    color: '#0A0E27',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statInfo: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#8892A6',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  growth: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  engagementCard: {
    backgroundColor: '#1A1F3A',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  engagementLabel: {
    fontSize: 14,
    color: '#8892A6',
    marginBottom: 8,
  },
  engagementValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00FF9F',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3A4166',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FF9F',
    borderRadius: 4,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  topTakeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1F3A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#3A4166',
  },
  topTakeRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#00FF9F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0E27',
  },
  topTakeInfo: {
    flex: 1,
  },
  topTakeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  topTakeStats: {
    flexDirection: 'row',
    gap: 16,
  },
  topTakeStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topTakeStatText: {
    fontSize: 12,
    color: '#B8C5D6',
  },
});

