import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findNearestVenue } from "@/lib/venue-detection";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { latitude, longitude } = body;

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

    // Fetch all venues from database
    const venues = await prisma.venue.findMany({
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

    // Find nearest venue within 500m
    const result = findNearestVenue(
      { latitude, longitude },
      venues,
      500 // 500 meters = roughly at the venue
    );

    if (!result) {
      return NextResponse.json({
        atVenue: false,
        venue: null,
        distance: null,
      });
    }

    // Try to match venue to an active game from odds API
    let activeGame = null;
    try {
      // Fetch current games
      const oddsResponse = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/odds?ticker=1`
      );
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
      }
    } catch (error) {
      console.error("[venue-detect] Failed to fetch active games:", error);
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
      { error: "Venue detection failed" },
      { status: 500 }
    );
  }
}
