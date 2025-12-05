import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get database user
    const dbUser = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get date range from query params (default: last 30 days)
    const searchParams = request.nextUrl.searchParams;
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get user's Hot Takes
    const userHotTakes = await prisma.hotTake.findMany({
      where: {
        authorId: dbUser.id,
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        createdAt: true,
        _count: {
          select: {
            Reaction: true,
            Comment: true,
            views: true,
          },
        } as any,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get daily analytics for the date range
    const dailyStats = await (prisma as any).daily_analytics.findMany({
      where: {
        takeId: {
          in: userHotTakes.map((take) => take.id),
        },
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Calculate totals
    const totalViews = userHotTakes.reduce(
      (sum, take) => sum + ((take._count as any).views || 0),
      0
    );
    const totalLikes = userHotTakes.reduce(
      (sum, take) => sum + ((take._count as any).Reaction || 0),
      0
    );
    const totalComments = userHotTakes.reduce(
      (sum, take) => sum + ((take._count as any).Comment || 0),
      0
    );

    // Group daily stats by date
    const dailyViewsMap = new Map<string, number>();
    const dailyLikesMap = new Map<string, number>();
    const dailyCommentsMap = new Map<string, number>();

    dailyStats.forEach((stat) => {
      const dateKey = stat.date.toISOString().split('T')[0];
      dailyViewsMap.set(
        dateKey,
        (dailyViewsMap.get(dateKey) || 0) + stat.views
      );
      dailyLikesMap.set(
        dateKey,
        (dailyLikesMap.get(dateKey) || 0) + stat.likes
      );
      dailyCommentsMap.set(
        dateKey,
        (dailyCommentsMap.get(dateKey) || 0) + stat.comments
      );
    });

    // Convert maps to arrays
    const chartData = Array.from(dailyViewsMap.entries()).map(
      ([date, views]) => ({
        date,
        views,
        likes: dailyLikesMap.get(date) || 0,
        comments: dailyCommentsMap.get(date) || 0,
      })
    );

    // Get top performing Hot Takes
    const topHotTakes = userHotTakes
      .sort((a, b) => ((b._count as any).views || 0) - ((a._count as any).views || 0))
      .slice(0, 5)
      .map((take) => ({
        id: take.id,
        title: take.title,
        views: (take._count as any).views || 0,
        likes: (take._count as any).Reaction || 0,
        comments: (take._count as any).Comment || 0,
        engagementRate:
          (take._count as any).views > 0
            ? (
                (((take._count as any).Reaction + (take._count as any).Comment) /
                  (take._count as any).views) *
                100
              ).toFixed(2)
            : '0',
      }));

    // Calculate growth (compare first half vs second half of period)
    const midpoint = Math.floor(chartData.length / 2);
    const firstHalfViews = chartData
      .slice(0, midpoint)
      .reduce((sum, day) => sum + day.views, 0);
    const secondHalfViews = chartData
      .slice(midpoint)
      .reduce((sum, day) => sum + day.views, 0);

    const viewsGrowth =
      firstHalfViews > 0
        ? (((secondHalfViews - firstHalfViews) / firstHalfViews) * 100).toFixed(
            1
          )
        : '0';

    return NextResponse.json({
      summary: {
        totalViews,
        totalLikes,
        totalComments,
        totalHotTakes: userHotTakes.length,
        viewsGrowth: `${viewsGrowth}%`,
        engagementRate:
          totalViews > 0
            ? (((totalLikes + totalComments) / totalViews) * 100).toFixed(2) +
              '%'
            : '0%',
      },
      chartData,
      topHotTakes,
      period: {
        days,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
