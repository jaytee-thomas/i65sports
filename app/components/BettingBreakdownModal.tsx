"use client";

import { useEffect } from "react";

type Game = {
  id?: string;
  league: string;
  home: string;
  away: string;
  mlHome: number;
  mlAway: number;
  spread: number;
  total: number;
  publicWinning?: boolean; // true = public winning, false = books winning
};

type BettingBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  games: Game[];
  booksWinPercentage: number;
};

export default function BettingBreakdownModal({
  isOpen,
  onClose,
  games,
  booksWinPercentage,
}: BettingBreakdownModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const publicWinningGames = games.filter((g) => g.publicWinning === true);
  const booksWinningGames = games.filter((g) => g.publicWinning === false);
  const publicWinPercentage = 100 - booksWinPercentage;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-ash/60 bg-gradient-to-br from-midnight via-graphite to-iron shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-ash/40 bg-midnight/95 backdrop-blur-sm px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-white">
                  Live Betting Breakdown
                </h2>
                <p className="mt-1 text-sm text-neutral-400">
                  Real-time analysis of where the money is flowing
                </p>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-ash/60 bg-graphite/50 text-neutral-400 transition hover:border-neon-emerald hover:text-neon-emerald"
              >
                ✕
              </button>
            </div>

            {/* Overall Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-green-500/30 bg-green-900/20 p-4">
                <div className="text-sm uppercase tracking-wider text-green-400">
                  Public Winning
                </div>
                <div className="mt-2 text-3xl font-black text-green-400">
                  {publicWinPercentage.toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  {publicWinningGames.length} games
                </div>
              </div>

              <div className="rounded-2xl border border-red-500/30 bg-red-900/20 p-4">
                <div className="text-sm uppercase tracking-wider text-red-400">
                  Books Winning
                </div>
                <div className="mt-2 text-3xl font-black text-red-400">
                  {booksWinPercentage.toFixed(1)}%
                </div>
                <div className="mt-1 text-xs text-neutral-400">
                  {booksWinningGames.length} games
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 p-8">
            {/* Public Winning Section */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
                  <span className="text-lg">📈</span>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-green-400">
                  Public is Winning (Books Losing)
                </h3>
              </div>

              {publicWinningGames.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No games currently favoring the public
                </p>
              ) : (
                <div className="space-y-3">
                  {publicWinningGames.map((game, index) => (
                    <div
                      key={game.id || `public-${index}`}
                      className="rounded-xl border border-green-500/30 bg-green-900/10 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="rounded bg-green-500/20 px-2 py-1 text-xs font-bold uppercase tracking-wider text-green-400">
                            {game.league}
                          </span>
                          <div className="text-sm">
                            <span className="font-semibold text-white">
                              {game.away}
                            </span>
                            <span className="mx-2 text-neutral-500">@</span>
                            <span className="font-semibold text-white">
                              {game.home}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">Spread</div>
                            <div className="font-mono text-sm font-bold text-white">
                              {game.spread > 0 ? "+" : ""}
                              {game.spread}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">ML</div>
                            <div className="font-mono text-sm font-bold text-green-400">
                              {game.mlHome > 0 ? "+" : ""}
                              {game.mlHome}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">O/U</div>
                            <div className="font-mono text-sm font-bold text-white">
                              {game.total}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Books Winning Section */}
            <section>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/20">
                  <span className="text-lg">📉</span>
                </div>
                <h3 className="text-xl font-bold uppercase tracking-tight text-red-400">
                  Books are Crushing
                </h3>
              </div>

              {booksWinningGames.length === 0 ? (
                <p className="text-sm text-neutral-500">
                  No games currently favoring the books
                </p>
              ) : (
                <div className="space-y-3">
                  {booksWinningGames.map((game, index) => (
                    <div
                      key={game.id || `books-${index}`}
                      className="rounded-xl border border-red-500/30 bg-red-900/10 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="rounded bg-red-500/20 px-2 py-1 text-xs font-bold uppercase tracking-wider text-red-400">
                            {game.league}
                          </span>
                          <div className="text-sm">
                            <span className="font-semibold text-white">
                              {game.away}
                            </span>
                            <span className="mx-2 text-neutral-500">@</span>
                            <span className="font-semibold text-white">
                              {game.home}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">Spread</div>
                            <div className="font-mono text-sm font-bold text-white">
                              {game.spread > 0 ? "+" : ""}
                              {game.spread}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">ML</div>
                            <div className="font-mono text-sm font-bold text-red-400">
                              {game.mlHome > 0 ? "+" : ""}
                              {game.mlHome}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-neutral-500">O/U</div>
                            <div className="font-mono text-sm font-bold text-white">
                              {game.total}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Footer */}
          <div className="border-t border-ash/40 bg-midnight/95 px-8 py-4">
            <p className="text-center text-xs text-neutral-500">
              Data updates every 30 seconds • For entertainment purposes only
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

