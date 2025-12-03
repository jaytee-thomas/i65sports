import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = params;

    // Find or create the requested user
    // First try to find by database ID
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            hotTakes: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    // If not found by ID, try by Clerk ID (in case frontend sends Clerk ID)
    if (!user) {
      user = await prisma.user.findUnique({
        where: { clerkId: userId },
        include: {
          _count: {
            select: {
              hotTakes: true,
              followers: true,
              following: true,
            },
          },
        },
      });
    }

    // If still not found and it's the current user, create them
    if (!user) {
      if (userId === clerkUser.id) {
        user = await prisma.user.create({
          data: {
            clerkId: clerkUser.id,
            email: clerkUser.emailAddresses[0]?.emailAddress || '',
            username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
          },
          include: {
            _count: {
              select: {
                hotTakes: true,
                followers: true,
                following: true,
              },
            },
          },
        });
        console.log('✅ Created new user:', user.id);
      } else {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
    }

    // Check if current user is following this profile
    const currentDbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    let isFollowing = false;
    if (currentDbUser && currentDbUser.id !== user.id) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: currentDbUser.id,
          followingId: user.id,
        },
      });
      isFollowing = !!follow;
    }

    // Get user's Hot Takes
    const hotTakes = await prisma.hotTake.findMany({
      where: {
        authorId: user.id,
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        title: true,
        videoUrl: true,
        thumbUrl: true,
        venueName: true,
        sport: true,
        createdAt: true,
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt,
      isFollowing,
      followersCount: user._count.followers,
      followingCount: user._count.following,
      hotTakesCount: user._count.hotTakes,
      hotTakes,
    });
  } catch (error) {
    console.error('[user-get] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// UPDATE USER PROFILE
export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const clerkUser = await currentUser();

    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find or create current user in database
    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      // Auto-create user if doesn't exist
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
        },
      });
      console.log('✅ Created new user:', dbUser.id);
    }

    // Check if user is updating their own profile
    if (dbUser.id !== params.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { username, bio, avatarUrl } = await request.json();

    // Validate username if provided
    if (username) {
      // Check username format (alphanumeric, underscore, 3-20 chars)
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(username)) {
        return NextResponse.json(
          { error: 'Username must be 3-20 characters (letters, numbers, underscore only)' },
          { status: 400 }
        );
      }

      // Check if username is already taken
      const existingUser = await prisma.user.findUnique({
        where: { username },
      });

      if (existingUser && existingUser.id !== params.userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: {
        ...(username && { username }),
        ...(bio !== undefined && { bio }),
        ...(avatarUrl !== undefined && { avatarUrl }),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

