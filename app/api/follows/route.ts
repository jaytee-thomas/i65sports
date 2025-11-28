import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Follow a user
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followingId } = await request.json();

    // Get current user from database
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Can't follow yourself
    if (dbUser.id === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: dbUser.id,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: 'Already following' }, { status: 400 });
    }

    // Create follow
    const follow = await prisma.follow.create({
      data: {
        followerId: dbUser.id,
        followingId: followingId,
      },
    });

    return NextResponse.json({ success: true, follow });
  } catch (error) {
    console.error('Follow error:', error);
    return NextResponse.json({ error: 'Failed to follow' }, { status: 500 });
  }
}

// Unfollow a user
export async function DELETE(request: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const followingId = searchParams.get('followingId');

    if (!followingId) {
      return NextResponse.json({ error: 'Missing followingId' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete follow
    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId: dbUser.id,
          followingId: followingId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unfollow error:', error);
    return NextResponse.json({ error: 'Failed to unfollow' }, { status: 500 });
  }
}

// Get follow status
export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: dbUser.id,
          followingId: userId,
        },
      },
    });

    return NextResponse.json({ isFollowing: !!isFollowing });
  } catch (error) {
    console.error('Follow status error:', error);
    return NextResponse.json({ error: 'Failed to get follow status' }, { status: 500 });
  }
}

