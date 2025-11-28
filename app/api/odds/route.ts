import { NextResponse } from 'next/server';
import { getUpcomingGames, getAllUpcomingGames } from '@/lib/oddsApi';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sport = searchParams.get('sport') as any;

  try {
    const games = sport 
      ? await getUpcomingGames(sport)
      : await getAllUpcomingGames();

    return NextResponse.json({
      success: true,
      games,
      count: games.length,
    });
  } catch (error) {
    console.error('Odds API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch odds' },
      { status: 500 }
    );
  }
}
