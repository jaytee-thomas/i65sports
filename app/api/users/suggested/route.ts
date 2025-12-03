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

    // Get users the current user is NOT following
    // Ordered by follower count
    const suggestedUsers = await prisma.user.findMany({
      where: {
        id: { not: dbUser.id },
        NOT: {
          followers: {
            some: { followerId: dbUser.id },
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
        followers: { _count: 'desc' },
      },
      take: 20,
    });

    // Add isFollowing field
    const usersWithFollowStatus = suggestedUsers.map(user => ({
      ...user,
      isFollowing: false,
    }));

    return NextResponse.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error('Error fetching suggested users:', error);
    return NextResponse.json({ error: 'Failed to fetch suggested users' }, { status: 500 });
  }
}

