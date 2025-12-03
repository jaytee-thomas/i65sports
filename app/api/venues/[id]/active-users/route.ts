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

    // Get users checked in within last 4 hours
    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

    const activeCheckIns = await prisma.checkIn.findMany({
      where: {
        venueId: id,
        checkedInAt: {
          gte: fourHoursAgo,
        },
        checkedOutAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        checkedInAt: 'desc',
      },
    });

    return NextResponse.json({ 
      activeUsers: activeCheckIns.map(c => c.user),
      count: activeCheckIns.length 
    });
  } catch (error) {
    console.error('[venue-active-users]:', error);
    return NextResponse.json({ error: 'Failed to load active users' }, { status: 500 });
  }
}

