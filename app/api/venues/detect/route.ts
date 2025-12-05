import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findNearestVenue } from "@/lib/venue-detection";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

    console.log('[venue-detect] Received coordinates:', { latitude, longitude });

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number" ||
      !isFinite(latitude) ||
      !isFinite(longitude)
    ) {
      return NextResponse.json(
        { error: "Valid latitude and longitude required" },
        { status: 400 }
      );
    }

    // Fetch all venues from database (NOTE: Model name is 'venues' not 'venue')
    const venues = await (prisma as any).venues.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        latitude: true,
        longitude: true,
        team: true,
        sport: true,
      },
    });

    console.log('[venue-detect] Found venues in database:', venues.length);

    if (venues.length === 0) {
      console.warn('[venue-detect] No venues in database - database may need seeding');
      return NextResponse.json({
        atVenue: false,
        venue: null,
        distance: null,
        message: 'No venues in database',
      });
    }

    // Find nearest venue within 500m
    const result = findNearestVenue(
      { latitude, longitude },
      venues,
      500 // 500 meters = roughly at the venue
    );

    if (!result) {
      console.log('[venue-detect] No venue found within 500m');
      return NextResponse.json({
        atVenue: false,
        venue: null,
        distance: null,
      });
    }

    console.log('[venue-detect] Found venue:', result.venue.name, 'Distance:', result.distance, 'm');

    // Try to match venue to an active game from odds API
    let activeGame = null;
    try {
      // Fetch current games
      const oddsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/odds?ticker=1`
      );
      
      if (oddsResponse.ok) {
        const oddsData = await oddsResponse.json();

        if (oddsData.items) {
          // Try to match venue team to games
          // This is simplified - you'll want to enhance this matching logic
          activeGame = oddsData.items.find(
            (game: any) =>
              (result.venue.team && 
               (game.home.includes(result.venue.team.split(" ").pop()) ||
                game.away.includes(result.venue.team.split(" ").pop()))) ||
              game.league === result.venue.sport
          );
          
          if (activeGame) {
            console.log('[venue-detect] Matched active game:', activeGame);
          }
        }
      }
    } catch (error) {
      console.error("[venue-detect] Failed to fetch active games:", error);
      // Continue without active game data
    }

    return NextResponse.json({
      atVenue: true,
      venue: {
        id: result.venue.id,
        name: result.venue.name,
        city: result.venue.city,
        state: result.venue.state,
        team: result.venue.team,
        sport: result.venue.sport,
      },
      distance: Math.round(result.distance),
      activeGame: activeGame || null,
    });
  } catch (error) {
    console.error("[venue-detect] Error:", error);
    return NextResponse.json(
      { error: "Venue detection failed", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
