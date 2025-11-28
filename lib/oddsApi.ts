const ODDS_API_KEY = process.env.ODDS_API_KEY;

const BASE_URL = 'https://api.the-odds-api.com/v4';

export interface Game {
  id: string;
  sport_key: string;
  sport_title: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: Bookmaker[];
}

export interface Bookmaker {
  key: string;
  title: string;
  last_update: string;
  markets: Market[];
}

export interface Market {
  key: string;
  last_update: string;
  outcomes: Outcome[];
}

export interface Outcome {
  name: string;
  price: number;
  point?: number;
}

const SPORTS = {
  NBA: 'basketball_nba',
  NFL: 'americanfootball_nfl',
  NCAAF: 'americanfootball_ncaaf',
  NCAAB: 'basketball_ncaab',
  MLB: 'baseball_mlb',
  NHL: 'icehockey_nhl',
};

export async function getUpcomingGames(sport: keyof typeof SPORTS = 'NBA') {
  try {
    const sportKey = SPORTS[sport];

    const response = await fetch(
      `${BASE_URL}/sports/${sportKey}/odds/?apiKey=${ODDS_API_KEY}&regions=us&markets=h2h,spreads,totals&oddsFormat=american`,
      { next: { revalidate: 60 } } // Cache for 1 minute
    );

    if (!response.ok) {
      throw new Error(`Odds API error: ${response.status}`);
    }

    const games: Game[] = await response.json();

    return games;
  } catch (error) {
    console.error('Error fetching odds:', error);
    return [];
  }
}

export async function getAllUpcomingGames() {
  const sports: (keyof typeof SPORTS)[] = ['NBA', 'NFL', 'NCAAF', 'NCAAB'];

  const allGames = await Promise.all(
    sports.map(sport => getUpcomingGames(sport))
  );
  
  return allGames.flat().sort((a, b) => 
    new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
  );
}

export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function getBestOdds(bookmakers: Bookmaker[], team: string, market: string = 'h2h') {
  let bestOdds = -Infinity;
  let bestBook = '';

  bookmakers.forEach(book => {
    const marketData = book.markets.find(m => m.key === market);
    if (marketData) {
      const outcome = marketData.outcomes.find(o => o.name === team);
      if (outcome && outcome.price > bestOdds) {
        bestOdds = outcome.price;
        bestBook = book.title;
      }
    }
  });

  return { odds: bestOdds, book: bestBook };
}

