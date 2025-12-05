'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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

export default function DashboardPage() {
  const { user } = useUser();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [range]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/analytics?range=${range}`);
      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">No analytics data available</div>
      </div>
    );
  }

  // Transform data for charts
  const chartData = analytics.weeklyData.labels.map((label, index) => ({
    day: label,
    views: analytics.weeklyData.views[index],
    likes: analytics.weeklyData.likes[index],
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName || 'Creator'}!</p>
        </div>

        {/* Time Range Filter */}
        <div className="mb-6 flex gap-2">
          {['7d', '30d', '90d'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                range === r
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Views"
            value={analytics.overview.totalViews.toLocaleString()}
            growth={analytics.growth.viewsGrowth}
            icon="👁️"
          />
          <StatCard
            title="Total Likes"
            value={analytics.overview.totalLikes.toLocaleString()}
            icon="❤️"
          />
          <StatCard
            title="Total Comments"
            value={analytics.overview.totalComments.toLocaleString()}
            icon="💬"
          />
          <StatCard
            title="Followers"
            value={analytics.overview.totalFollowers.toLocaleString()}
            growth={analytics.growth.followersGrowth}
            icon="👥"
          />
        </div>

        {/* Engagement Rate */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
          <div className="text-4xl font-bold text-blue-600">
            {analytics.overview.engagementRate.toFixed(2)}%
          </div>
          <p className="text-gray-600 mt-2">
            Based on likes, comments, and shares relative to views
          </p>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Engagement Chart */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Engagement Over Time</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="likes" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Hot Takes */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performing Hot Takes</h3>
          <div className="space-y-4">
            {analytics.topHotTakes.map((take, index) => (
              <div
                key={take.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{take.title || 'Untitled'}</h4>
                    <div className="flex gap-4 text-sm text-gray-600 mt-1">
                      <span>👁️ {take.views.toLocaleString()} views</span>
                      <span>❤️ {take.likes.toLocaleString()} likes</span>
                      <span>💬 {take.comments.toLocaleString()} comments</span>
                    </div>
                  </div>
                </div>
                <a
                  href={`/hot-takes/${take.id}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* Best Time to Post (Coming Soon) */}
        <div className="mt-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-sm p-6 text-white">
          <h3 className="text-lg font-semibold mb-2">🚀 Coming Soon: Best Time to Post</h3>
          <p className="opacity-90">
            We're analyzing your audience behavior to recommend the optimal times to post your Hot Takes for maximum engagement.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, growth, icon }: { title: string; value: string; growth?: number; icon: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-600 text-sm font-medium">{title}</span>
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      {growth !== undefined && (
        <div className={`text-sm font-medium ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
          {growth >= 0 ? '↑' : '↓'} {Math.abs(growth).toFixed(1)}% vs previous period
        </div>
      )}
    </div>
  );
}

