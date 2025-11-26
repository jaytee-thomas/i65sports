"use client";

export default function EnhancedOddsTicker() {
  const games = [
    { league: "NBA", team1: "LAL", team2: "GSW", spread: "-3.5", overUnder: "223.5", moneyline: "-150" },
    { league: "NFL", team1: "KC", team2: "BUF", spread: "-2.5", overUnder: "48.5", moneyline: "-125" },
    { league: "NBA", team1: "BOS", team2: "MIA", spread: "-7.5", overUnder: "215.5", moneyline: "-280" },
    { league: "NFL", team1: "SF", team2: "DAL", spread: "-4.5", overUnder: "45.5", moneyline: "-180" },
    { league: "NBA", team1: "DEN", team2: "PHX", spread: "-1.5", overUnder: "228.5", moneyline: "-110" },
  ];

  // Duplicate games for infinite scroll effect
  const allGames = [...games, ...games];

  return (
    <div className="w-full bg-background-medium border-b border-border overflow-hidden">
      <div className="relative">
        {/* Scrolling Container */}
        <div className="flex animate-scroll hover:pause-animation py-2 sm:py-3">
          {allGames.map((game, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-3 sm:px-4 md:px-6 border-r border-border last:border-r-0 min-w-[200px] sm:min-w-[250px]"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                {/* League Badge */}
                <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold rounded ${
                  game.league === "NBA" 
                    ? "bg-orange-500/20 text-orange-400" 
                    : "bg-green-500/20 text-green-400"
                }`}>
                  {game.league}
                </span>

                {/* Matchup */}
                <div className="flex items-center gap-1 sm:gap-1.5">
                  <span className="text-text-primary font-bold text-xs sm:text-sm">{game.team1}</span>
                  <span className="text-text-muted text-[10px] sm:text-xs">@</span>
                  <span className="text-text-primary font-bold text-xs sm:text-sm">{game.team2}</span>
                </div>

                {/* Odds */}
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
                  <span className="text-text-secondary">
                    <span className="text-text-muted hidden sm:inline">O/U:</span> {game.overUnder}
                  </span>
                  <span className="text-accent font-bold">
                    {game.moneyline}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Fade Edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-background-medium to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-background-medium to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 30s linear infinite;
        }

        .hover\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
