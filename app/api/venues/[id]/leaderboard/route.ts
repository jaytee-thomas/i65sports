import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get venue
    const venue = await prisma.venue.findUnique({
      where: { id },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get users with most Hot Takes at this venue today
    const usersWithTakes = await prisma.hotTake.groupBy({
      by: ['authorId'],
      where: {
        venueName: venue.name,
        recordedAtVenue: true,
        status: 'PUBLISHED',
        createdAt: {
          gte: today,
        },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 10,
    });

    // Get user details
    const userIds = usersWithTakes.map(u => u.authorId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds,
        },
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
      },
    });

    // Combine with counts
    const leaderboard = users.map(user => {
      const takeCount = usersWithTakes.find(u => u.authorId === user.id)?._count.id || 0;
      return {
        ...user,
        hotTakeCount: takeCount,
      };
    }).sort((a, b) => b.hotTakeCount - a.hotTakeCount);

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('[venue-leaderboard]:', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}

