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

    // FIXED: Changed from prisma.venue to prisma.venues (matches schema)
    const venues = await (prisma as any).venues.findMany();
    console.log('🏟️ Found venues in DB:', venues.length);

    if (venues.length === 0) {
      console.warn('⚠️ No venues in database - you may need to run the seed script');
      return NextResponse.json({ venues: [] });
    }

    const nearbyVenues = venues
      .map((venue: any) => ({
        ...venue,
        distance: calculateDistance(latitude, longitude, venue.latitude, venue.longitude),
      }))
      .filter((venue: any) => venue.distance <= radius)
      .sort((a: any, b: any) => a.distance - b.distance);

    console.log('✅ Nearby venues after filter:', nearbyVenues.length);
    
    if (nearbyVenues.length > 0) {
      console.log('🎯 Closest venue:', nearbyVenues[0].name, `(${nearbyVenues[0].distance.toFixed(2)}km away)`);
    }

    return NextResponse.json({ venues: nearbyVenues });
  } catch (error) {
    console.error('[venues-nearby] Error:', error);
    return NextResponse.json({ 
      error: 'Failed to find venues',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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
