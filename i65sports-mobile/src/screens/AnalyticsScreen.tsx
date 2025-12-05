import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';

const API_URL = 'http://192.168.86.226:3000/api';

interface AnalyticsData {
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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const response = await axios.get(`${API_URL}/analytics?range=${range}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (!analytics) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>No analytics data available</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <Text style={styles.title}>Analytics Dashboard</Text>

        {/* Time Range Selector */}
        <View style={styles.rangeSelector}>
          {['7d', '30d', '90d'].map((r) => (
            <TouchableOpacity
              key={r}
              onPress={() => setRange(r)}
              style={[styles.rangeButton, range === r && styles.rangeButtonActive]}
            >
              <Text style={[styles.rangeButtonText, range === r && styles.rangeButtonTextActive]}>
                {r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : '90 Days'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="👁️"
            label="Views"
            value={analytics.overview.totalViews.toLocaleString()}
            growth={analytics.growth.viewsGrowth}
          />
          <StatCard
            icon="❤️"
            label="Likes"
            value={analytics.overview.totalLikes.toLocaleString()}
          />
          <StatCard
            icon="💬"
            label="Comments"
            value={analytics.overview.totalComments.toLocaleString()}
          />
          <StatCard
            icon="👥"
            label="Followers"
            value={analytics.overview.totalFollowers.toLocaleString()}
            growth={analytics.growth.followersGrowth}
          />
        </View>

        {/* Engagement Rate */}
        <View style={styles.engagementCard}>
          <Text style={styles.engagementLabel}>Engagement Rate</Text>
          <Text style={styles.engagementValue}>
            {analytics.overview.engagementRate.toFixed(2)}%
          </Text>
          <Text style={styles.engagementSubtext}>
            Based on likes, comments, and shares
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Views Over Time</Text>
          <LineChart
            data={{
              labels: analytics.weeklyData.labels,
              datasets: [
                {
                  data: analytics.weeklyData.views,
                },
              ],
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16,
              },
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: '#3b82f6',
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Top Hot Takes */}
        <View style={styles.topTakesCard}>
          <Text style={styles.topTakesTitle}>Top Performing Hot Takes</Text>
          {analytics.topHotTakes.map((take, index) => (
            <View key={take.id} style={styles.topTakeItem}>
              <View style={styles.topTakeRank}>
                <Text style={styles.topTakeRankText}>#{index + 1}</Text>
              </View>
              <View style={styles.topTakeInfo}>
                <Text style={styles.topTakeTitle} numberOfLines={1}>
                  {take.title || 'Untitled'}
                </Text>
                <View style={styles.topTakeStats}>
                  <Text style={styles.topTakeStat}>👁️ {take.views}</Text>
                  <Text style={styles.topTakeStat}>❤️ {take.likes}</Text>
                  <Text style={styles.topTakeStat}>💬 {take.comments}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Coming Soon */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>🚀 Coming Soon</Text>
          <Text style={styles.comingSoonText}>
            Best time to post recommendations based on your audience behavior
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, label, value, growth }: any) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {growth !== undefined && (
        <Text style={[styles.statGrowth, growth >= 0 ? styles.growthPositive : styles.growthNegative]}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}%
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  rangeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  rangeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    alignItems: 'center',
  },
  rangeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  rangeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rangeButtonTextActive: {
    color: '#ffffff',
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
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  statGrowth: {
    fontSize: 12,
    fontWeight: '600',
  },
  growthPositive: {
    color: '#10b981',
  },
  growthNegative: {
    color: '#ef4444',
  },
  engagementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  engagementLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  engagementValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 8,
  },
  engagementSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  chart: {
    borderRadius: 16,
  },
  topTakesCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  topTakesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  topTakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  topTakeRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  topTakeRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6b7280',
  },
  topTakeInfo: {
    flex: 1,
  },
  topTakeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  topTakeStats: {
    flexDirection: 'row',
    gap: 12,
  },
  topTakeStat: {
    fontSize: 12,
    color: '#6b7280',
  },
  comingSoonCard: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
});
