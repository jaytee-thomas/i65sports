import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { venueId, latitude, longitude } = body;

    // Find or create user
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

    // Get venue
    const venue = await prisma.venue.findUnique({
      where: { id: venueId },
    });

    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }

    // Verify user is near venue (within 500m)
    const distance = calculateDistance(
      latitude,
      longitude,
      venue.latitude,
      venue.longitude
    );

    if (distance > 0.5) { // 0.5 km = 500m
      return NextResponse.json(
        { error: 'You must be at the venue to check in' },
        { status: 400 }
      );
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingCheckIn = await prisma.checkIn.findFirst({
      where: {
        userId: dbUser.id,
        venueId: venueId,
        checkedInAt: {
          gte: today,
        },
        checkedOutAt: null,
      },
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { message: 'Already checked in', checkIn: existingCheckIn },
        { status: 200 }
      );
    }

    // Create check-in
    const checkIn = await prisma.checkIn.create({
      data: {
        userId: dbUser.id,
        venueId: venueId,
      },
      include: {
        venue: true,
      },
    });

    return NextResponse.json({ checkIn }, { status: 201 });
  } catch (error) {
    console.error('[check-in-post]:', error);
    return NextResponse.json({ error: 'Failed to check in' }, { status: 500 });
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}

