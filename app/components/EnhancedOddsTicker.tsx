"use client";

import { useEffect, useState, useRef } from "react";
import BettingBreakdownModal from "./BettingBreakdownModal";

type OddsMovement = "up" | "down" | "neutral";

type Game = {
  id?: string;
  league: string;
  home: string;
  away: string;
  mlHome: number;
  mlAway: number;
  spread: number;
  total: number;
  movement?: OddsMovement;
  publicWinning?: boolean;
};

export default function EnhancedOddsTicker() {
  const [games, setGames] = useState<Game[]>([]);
  const [previousGames, setPreviousGames] = useState<Game[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [booksWinPercentage, setBooksWinPercentage] = useState(50);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate books win percentage
  const calculateBooksWinPercentage = (gamesData: Game[]) => {
    if (gamesData.length === 0) return 50;
    
    const booksWinning = gamesData.filter((game) => {
      const isHeavyFavorite = game.mlHome < -150 || game.mlAway < -150;
      game.publicWinning = !isHeavyFavorite;
      return isHeavyFavorite;
    });
    
    return (booksWinning.length / gamesData.length) * 100;
  };

  const fetchOdds = async () => {
    try {
      const response = await fetch("/api/odds?ticker=1");
      const data = await response.json();
      
      if (data.items && Array.isArray(data.items)) {
        const gamesWithMovement = data.items.map((game: Game) => {
          const gameId = `${game.league}-${game.away}-${game.home}`;
          const prevGame = previousGames.find((g) => 
            `${g.league}-${g.away}-${g.home}` === gameId
          );
          
          let movement: OddsMovement = "neutral";
          
          if (prevGame) {
            if (game.mlHome > prevGame.mlHome) {
              movement = "up";
            } else if (game.mlHome < prevGame.mlHome) {
              movement = "down";
            }
          }
          
          return { ...game, id: gameId, movement };
        });
        
        const winPercentage = calculateBooksWinPercentage(gamesWithMovement);
        setBooksWinPercentage(winPercentage);
        
        setPreviousGames(games);
        setGames(gamesWithMovement);
      }
    } catch (error) {
      console.error("[ticker] Failed to fetch odds:", error);
    }
  };

  // Fetch odds - run once and then every 30 seconds
  useEffect(() => {
    fetchOdds();
    const interval = setInterval(fetchOdds, 30000);
    return () => clearInterval(interval);
  }, []); // Empty dependency array - only run on mount

  // Auto-scroll animation - separate from data fetching
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || games.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5; // Slower for smoother animation

    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset when we've scrolled past half (since we duplicate the games)
      if (scrollPosition >= scrollContainer.scrollWidth / 2) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [games]); // Re-run when games change

  if (games.length === 0) {
    return (
      <div className="w-full bg-gradient-to-r from-graphite via-iron to-graphite py-3">
        <p className="text-center text-sm text-neutral-500 uppercase tracking-wider">
          Loading live odds...
        </p>
      </div>
    );
  }

  const duplicatedGames = [...games, ...games];

  return (
    <>
      <div className="relative w-full overflow-hidden bg-gradient-to-r from-graphite via-iron to-graphite border-y border-ash/40">
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-graphite to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-graphite to-transparent z-10 pointer-events-none" />
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex items-center gap-2 rounded-full border border-ash/60 bg-midnight/90 px-4 py-2 backdrop-blur-sm transition hover:border-neon-emerald hover:scale-105"
        >
          <span className="text-xs uppercase tracking-wider text-neutral-400">
            Books:
          </span>
          <span
            className={`text-sm font-bold ${
              booksWinPercentage >= 60
                ? "text-red-400"
                : booksWinPercentage <= 40
                ? "text-green-400"
                : "text-white"
            }`}
          >
            {booksWinPercentage.toFixed(0)}%
          </span>
          <span className="text-xs text-neutral-500">📊</span>
        </button>
        
        <div
          ref={scrollRef}
          className="flex gap-8 py-4 px-4 overflow-x-hidden"
        >
          {duplicatedGames.map((game, index) => (
            <div
              key={`${game.id}-${index}`}
              className="flex-shrink-0 flex items-center gap-6 px-6 py-2 rounded-lg bg-midnight/30 border border-ash/30 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 text-xs font-bold uppercase tracking-wider bg-neon-emerald/20 text-neon-emerald rounded">
                  {game.league}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="font-semibold text-white">{game.away}</span>
                  <span className="text-neutral-500 mx-1">@</span>
                  <span className="font-semibold text-white">{game.home}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    Spread
                  </div>
                  <div className="font-mono font-bold text-white">
                    {game.spread > 0 ? "+" : ""}
                    {game.spread}
                  </div>
                </div>

                <div className="text-center relative">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    ML
                  </div>
                  <div
                    className={`font-mono font-bold transition-colors duration-500 ${
                      game.movement === "up"
                        ? "text-green-400"
                        : game.movement === "down"
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {game.mlHome > 0 ? "+" : ""}
                    {game.mlHome}
                    
                    {game.movement === "up" && (
                      <span className="ml-1 text-green-400 animate-pulse">▲</span>
                    )}
                    {game.movement === "down" && (
                      <span className="ml-1 text-red-400 animate-pulse">▼</span>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-xs text-neutral-500 uppercase tracking-wide mb-1">
                    O/U
                  </div>
                  <div className="font-mono font-bold text-white">
                    {game.total}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald/70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald" />
                </span>
                <span className="text-xs uppercase tracking-wider text-neon-emerald font-semibold">
                  Live
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BettingBreakdownModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        games={games}
        booksWinPercentage={booksWinPercentage}
      />
    </>
  );
}
