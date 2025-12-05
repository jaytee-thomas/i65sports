import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    // Calculate date range
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // Get user's Hot Takes
    const hotTakes = await prisma.hotTake.findMany({
      where: {
        authorId: dbUser.id,
        createdAt: { gte: startDate },
      },
      include: {
        _count: {
          select: {
            Reaction: true,
            Comment: true,
            views: true,
          },
        },
      } as any,
    });

    // Calculate totals from real data
    const totalViews = hotTakes.reduce((sum, take) => sum + (take._count as any).views, 0);
    const totalLikes = hotTakes.reduce((sum, take) => sum + (take._count as any).Reaction, 0);
    const totalComments = hotTakes.reduce((sum, take) => sum + (take._count as any).Comment, 0);
    const totalShares = Math.floor(totalLikes * 0.2); // Estimate: 20% of likes result in shares

    // Get follower count
    const followersCount = await prisma.follow.count({
      where: { followingId: dbUser.id },
    });

    // Calculate engagement rate
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
      : 0;

    // Calculate growth from daily analytics
    const dailyAnalytics = await (prisma as any).daily_analytics.findMany({
      where: {
        takeId: {
          in: hotTakes.map(t => t.id),
        },
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    // Split into first/second half for growth calculation
    const midpoint = Math.floor(dailyAnalytics.length / 2);
    const firstHalf = dailyAnalytics.slice(0, midpoint);
    const secondHalf = dailyAnalytics.slice(midpoint);

    const firstHalfViews = firstHalf.reduce((sum, day) => sum + day.views, 0);
    const secondHalfViews = secondHalf.reduce((sum, day) => sum + day.views, 0);

    const viewsGrowth = firstHalfViews > 0 
      ? ((secondHalfViews - firstHalfViews) / firstHalfViews) * 100 
      : 0;

    const followersGrowth = 8.3; // TODO: Calculate from follower history when implemented

    // Get top performing Hot Takes
    const topHotTakes = hotTakes
      .sort((a, b) => (b._count as any).views - (a._count as any).views)
      .slice(0, 5)
      .map(take => ({
        id: take.id,
        title: take.title,
        views: (take._count as any).views,
        likes: (take._count as any).Reaction,
        comments: (take._count as any).Comment,
      }));

    // Generate weekly data from daily analytics
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      date.setHours(0, 0, 0, 0);
      return date;
    });

    const weeklyData = {
      labels: last7Days.map(date => 
        date.toLocaleDateString('en-US', { weekday: 'short' })
      ),
      views: last7Days.map(date => {
        const dayStats = dailyAnalytics.filter(stat => 
          stat.date.toDateString() === date.toDateString()
        );
        return dayStats.reduce((sum, stat) => sum + stat.views, 0);
      }),
      likes: last7Days.map(date => {
        const dayStats = dailyAnalytics.filter(stat => 
          stat.date.toDateString() === date.toDateString()
        );
        return dayStats.reduce((sum, stat) => sum + stat.likes, 0);
      }),
    };

    return NextResponse.json({
      overview: {
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        totalFollowers: followersCount,
        engagementRate,
      },
      growth: {
        viewsGrowth,
        followersGrowth,
      },
      topHotTakes,
      weeklyData,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
