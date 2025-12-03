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
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Get Hot Takes from this venue today (match by venueName)
    const hotTakes = await prisma.hotTake.findMany({
      where: {
        venueName: venue.name,
        recordedAtVenue: true,
        status: 'PUBLISHED',
        createdAt: {
          gte: today,
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
        _count: {
          select: {
            reactions: true,
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    return NextResponse.json({ hotTakes });
  } catch (error) {
    console.error('[venue-feed]:', error);
    return NextResponse.json({ error: 'Failed to load feed' }, { status: 500 });
  }
}

