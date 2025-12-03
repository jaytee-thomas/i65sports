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
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
          { bio: { contains: query, mode: 'insensitive' } },
        ],
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
      take: 20,
    });

    // Check if current user follows each result
    const followingIds = await prisma.follow.findMany({
      where: { followerId: dbUser.id },
      select: { followingId: true },
    });

    const followingSet = new Set(followingIds.map(f => f.followingId));

    const usersWithFollowStatus = users.map(user => ({
      ...user,
      isFollowing: followingSet.has(user.id),
    }));

    return NextResponse.json({ users: usersWithFollowStatus });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json({ error: 'Failed to search users' }, { status: 500 });
  }
}

