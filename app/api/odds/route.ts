import { NextResponse } from "next/server";

export async function GET() {
  // Demo data (replace with a real odds provider and cache in Redis)
  const items = [
    { league: "NFL", away: "DAL", home: "PHI", spread: -2.5, total: 47.5, mlAway: +115, mlHome: -135 },
    { league: "NBA", away: "LAL", home: "GSW", spread: +4.0, total: 230.5, mlAway: +150, mlHome: -170 },
    { league: "MLB", away: "NYY", home: "BOS", spread: -1.5, total: 8.5, mlAway: -120, mlHome: +105 },
    { league: "NHL", away: "TOR", home: "MTL", spread: -1.5, total: 6.0, mlAway: -140, mlHome: +125 },
  ];
  return NextResponse.json({ items });
}
