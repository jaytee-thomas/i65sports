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

    // Get users with most Hot Takes in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const trendingUsers = await prisma.user.findMany({
      where: {
        id: { not: dbUser.id },
        hotTakes: {
          some: {
            createdAt: { gte: thirtyDaysAgo },
            status: 'PUBLISHED',
          },
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        _count: {
          select: {
            hotTakes: true,
            followers: true,
            following: true,
          },
        },
      },
      orderBy: {
        hotTakes: { _count: 'desc' },
      },
      take: 10,
    });

    // Check if current user follows each trending user
    const followingIds = await prisma.follow.findMany({
      where: { followerId: dbUser.id },
      select: { followingId: true },
    });

    const followingSet = new Set(followingIds.map(f => f.followingId));

    const usersWithFollowStatus = trendingUsers.map(user => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }));

    return NextResponse.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error('Error fetching trending users:', error);
    return NextResponse.json({ error: 'Failed to fetch trending users' }, { status: 500 });
  }
}

