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
            reactions: true,
            comments: true,
          },
        },
      },
    });

    // Calculate totals (mock data for views and shares since not in schema)
    const totalViews = hotTakes.length * 127; // Mock: average 127 views per take
    const totalLikes = hotTakes.reduce((sum, take) => sum + take._count.reactions, 0);
    const totalComments = hotTakes.reduce((sum, take) => sum + take._count.comments, 0);
    const totalShares = Math.floor(totalLikes * 0.2); // Mock: 20% of likes result in shares

    // Get follower count
    const followersCount = await prisma.follow.count({
      where: { followingId: dbUser.id },
    });

    // Calculate engagement rate
    const engagementRate = totalViews > 0 
      ? ((totalLikes + totalComments + totalShares) / totalViews) * 100 
      : 0;

    // Mock growth data
    const viewsGrowth = 15.7;
    const followersGrowth = 8.3;

    // Get top performing Hot Takes
    const topHotTakes = hotTakes
      .sort((a, b) => b._count.reactions - a._count.reactions)
      .slice(0, 5)
      .map(take => ({
        id: take.id,
        title: take.title,
        views: 127, // Mock
        likes: take._count.reactions,
        comments: take._count.comments,
      }));

    // Generate weekly data
    const weeklyData = {
      labels: Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      }),
      views: Array.from({ length: 7 }, () => Math.floor(Math.random() * 200) + 50),
      likes: Array.from({ length: 7 }, () => Math.floor(Math.random() * 50) + 10),
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
