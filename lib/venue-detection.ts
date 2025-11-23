type Coordinates = {
  latitude: number;
  longitude: number;
};

type Venue = {
  id: string;
  name: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  team?: string;
  sport?: string;
};

/**
 * Calculate distance between two coordinates using Haversine formula
 * Returns distance in meters
 */
export function calculateDistance(
  coord1: Coordinates,
  coord2: Coordinates
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2.latitude * Math.PI) / 180;
  const Δφ = ((coord2.latitude - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2.longitude - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Find the nearest venue to given coordinates
 * Returns venue if within threshold (default 500m), null otherwise
 */
export function findNearestVenue(
  userCoords: Coordinates,
  venues: Venue[],
  thresholdMeters: number = 500
): { venue: Venue; distance: number } | null {
  let nearest: { venue: Venue; distance: number } | null = null;

  for (const venue of venues) {
    const distance = calculateDistance(userCoords, {
      latitude: venue.latitude,
      longitude: venue.longitude,
    });

    if (distance <= thresholdMeters) {
      if (!nearest || distance < nearest.distance) {
        nearest = { venue, distance };
      }
    }
  }

  return nearest;
}

/**
 * Check if coordinates are within venue bounds
 */
export function isAtVenue(
  userCoords: Coordinates,
  venueCoords: Coordinates,
  thresholdMeters: number = 500
): boolean {
  const distance = calculateDistance(userCoords, venueCoords);
  return distance <= thresholdMeters;
}

