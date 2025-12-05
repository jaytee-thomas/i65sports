import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: takeId } = params;

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

    // Get Hot Take with analytics
    const hotTake = await prisma.hotTake.findUnique({
      where: { id: takeId },
      include: {
        _count: {
          select: {
            views: true,
            reactions: true,
            comments: true,
          },
        },
        daily_analytics: {
          orderBy: {
            date: 'asc',
          },
          take: 30, // Last 30 days
        },
      },
    });

    if (!hotTake) {
      return NextResponse.json(
        { error: 'Hot Take not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (hotTake.authorId !== dbUser.id) {
      return NextResponse.json(
        { error: 'Not authorized to view analytics for this Hot Take' },
        { status: 403 }
      );
    }

    // Calculate engagement rate
    const engagementRate =
      hotTake._count.views > 0
        ? (
            ((hotTake._count.reactions + hotTake._count.comments) /
              hotTake._count.views) *
            100
          ).toFixed(2)
        : '0';

    // Format daily analytics
    const dailyData = hotTake.daily_analytics.map((day) => ({
      date: day.date.toISOString().split('T')[0],
      views: day.views,
      likes: day.likes,
      comments: day.comments,
      shares: day.shares,
    }));

    return NextResponse.json({
      hotTake: {
        id: hotTake.id,
        title: hotTake.title,
        createdAt: hotTake.createdAt,
      },
      summary: {
        totalViews: hotTake._count.views,
        totalLikes: hotTake._count.reactions,
        totalComments: hotTake._count.comments,
        engagementRate: `${engagementRate}%`,
      },
      dailyData,
    });
  } catch (error) {
    console.error('Error fetching Hot Take analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

