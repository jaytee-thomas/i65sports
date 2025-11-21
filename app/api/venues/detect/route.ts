import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lat, lng } = body;

    if (!lat || !lng) {
      return NextResponse.json(
        { error: "Missing lat/lng coordinates" },
        { status: 400 }
      );
    }

    // Mock venue detection - we'll add real venues later
    return NextResponse.json({
      venue: null,
      game: null,
    });

  } catch (error) {
    console.error("[venue-detect] Error:", error);
    return NextResponse.json(
      { error: "Failed to detect venue" },
      { status: 500 }
    );
  }
}