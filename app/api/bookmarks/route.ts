import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// Get user's bookmarks
export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      return NextResponse.json({ bookmarks: [] });
    }

    const bookmarks = await (prisma as any).bookmarks.findMany({
      where: { userId: dbUser.id },
      include: {
        HotTake: {
          include: {
            User: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
              },
            },
            _count: {
              select: {
                Reaction: true,
                Comment: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map response to frontend-friendly format
    const mappedBookmarks = bookmarks.map((bookmark: any) => ({
      ...bookmark,
      hotTake: {
        ...bookmark.HotTake,
        author: bookmark.HotTake.User,
        _count: {
          reactions: bookmark.HotTake._count.Reaction,
          comments: bookmark.HotTake._count.Comment,
        },
      },
    }));

    return NextResponse.json({ bookmarks: mappedBookmarks });
  } catch (error) {
    console.error('[bookmarks-get]:', error);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}

// Toggle bookmark
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { takeId } = body;

    let dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
    });

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          username: clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split('@')[0] || 'user',
        },
      });
    }

    // Check if already bookmarked
    const existing = await (prisma as any).bookmarks.findUnique({
      where: {
        userId_takeId: {
          userId: dbUser.id,
          takeId,
        },
      },
    });

    if (existing) {
      // Remove bookmark
      await (prisma as any).bookmarks.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ bookmarked: false });
    } else {
      // Add bookmark with generated ID
      await (prisma as any).bookmarks.create({
        data: {
          id: `bookmark_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          userId: dbUser.id,
          takeId,
        },
      });
      return NextResponse.json({ bookmarked: true }, { status: 201 });
    }
  } catch (error) {
    console.error('[bookmarks-post]:', error);
    return NextResponse.json({ error: 'Failed to toggle bookmark' }, { status: 500 });
  }
}
