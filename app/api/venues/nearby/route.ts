import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    console.log('📍 Nearby venues endpoint hit');
    
    const { searchParams } = new URL(request.url);
    const latitude = parseFloat(searchParams.get('latitude') || '0');
    const longitude = parseFloat(searchParams.get('longitude') || '0');
    const radius = parseFloat(searchParams.get('radius') || '1');

    console.log('📊 Query params:', { latitude, longitude, radius });

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude required' },
        { status: 400 }
      );
    }

    const venues = await prisma.venue.findMany();
    console.log('🏟️ Found venues in DB:', venues.length);

    const nearbyVenues = venues
      .map((venue) => ({
        ...venue,
        distance: calculateDistance(latitude, longitude, venue.latitude, venue.longitude),
      }))
      .filter((venue) => venue.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    console.log('✅ Nearby venues after filter:', nearbyVenues.length);

    return NextResponse.json({ venues: nearbyVenues });
  } catch (error) {
    console.error('[venues-nearby] Error:', error);
    return NextResponse.json({ error: 'Failed to find venues' }, { status: 500 });
  }
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
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
