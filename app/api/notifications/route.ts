import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

// GET all notifications for current user
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
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    const notifications = await prisma.notification.findMany({
      where: {
        userId: dbUser.id,
        ...(unreadOnly && { read: false }),
      },
      include: {
        actor: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        hotTake: {
          select: {
            id: true,
            title: true,
            thumbUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: dbUser.id,
        read: false,
      },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 });
  }
}

// PATCH - Mark notification(s) as read
export async function PATCH(request: Request) {
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

    const { notificationId, markAllAsRead } = await request.json();

    if (markAllAsRead) {
      await prisma.notification.updateMany({
        where: {
          userId: dbUser.id,
          read: false,
        },
        data: { read: true },
      });

      return NextResponse.json({ success: true, message: 'All marked as read' });
    } else if (notificationId) {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId: dbUser.id,
        },
        data: { read: true },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Update notification error:', error);
    return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
  }
}
