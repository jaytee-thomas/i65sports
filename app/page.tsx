import Link from "next/link";
import EnhancedOddsTicker from "./components/EnhancedOddsTicker";

const scoreboard = [
  {
    league: "NFL",
    home: { name: "Colts", score: 27, record: "3-1" },
    away: { name: "Bears", score: 23, record: "2-2" },
    status: "Q4 · 02:13",
    line: "-3.5",
    total: "47.5",
    updated: true,
  },
  {
    league: "NBA",
    home: { name: "Pacers", score: 112, record: "48-29" },
    away: { name: "Celtics", score: 109, record: "55-22" },
    status: "FINAL",
    line: "+2.5",
    total: "221.0",
    updated: false,
  },
  {
    league: "NHL",
    home: { name: "Red Wings", score: 3, record: "41-24" },
    away: { name: "Predators", score: 3, record: "39-26" },
    status: "OT · 03:44",
    line: "PK",
    total: "5.5",
    updated: true,
  },
  {
    league: "MLB",
    home: { name: "Cubs", score: 4, record: "71-68" },
    away: { name: "Cardinals", score: 2, record: "65-74" },
    status: "7TH · 1 OUT",
    line: "-1.5",
    total: "8.5",
    updated: false,
  },
];

const highlightClips = [
  {
    title: "McConnell drops the no-look dime",
    tag: "Game Flow",
    duration: "00:38",
  },
  {
    title: "Behind-the-scenes tunnel hype",
    tag: "Fan Reel",
    duration: "00:42",
  },
  {
    title: "Columnist breakdown: Colts blitz packages",
    tag: "Opinion",
    duration: "04:19",
  },
];

const hotTakePreviews = [
  {
    author: "sideline_scribe",
    take: "“The AFC runs through Indy if our tempo stays up.”",
    reactions: 24,
    replies: 12,
  },
  {
    author: "reel_deal",
    take: "“If Wemby adds 10 pounds of muscle, the league is finished.”",
    reactions: 31,
    replies: 18,
  },
];

const columnistSpotlight = [
  {
    name: "Sideline Scribe",
    headline: "Game-Day Mindset: How Underdogs Upset Favorites",
    pill: "Columnist · Weekly",
  },
  {
    name: "Numbers Lab",
    headline: "Why Indiana’s perimeter defense is quietly elite",
    pill: "Analytics",
  },
];

export default function Page() {
  return (
    <div className="space-y-10">
      <EnhancedOddsTicker />

      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-ash/70 bg-graphite/70 p-6 shadow-surface">
          <header className="flex items-center justify-between">
            <h1 className="font-display text-3xl font-semibold text-white">Live Scoreboard</h1>
            <span className="text-xs uppercase tracking-[0.32em] text-neutral-500">Powered by i65 Pulse</span>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {scoreboard.map((game) => (
              <article
                key={`${game.league}-${game.status}-${game.home.name}`}
                className="group rounded-2xl border border-ash/60 bg-iron/70 px-4 py-5 transition hover:border-neon-emerald/60 hover:shadow-glow-blue"
              >
                <header className="flex items-center justify-between text-xs uppercase tracking-[0.22em] text-neutral-500">
                  <span>{game.league}</span>
                  <span className="rounded-full border border-ash/60 bg-graphite px-2 py-0.5 font-numeric text-[11px] text-neutral-300">
                    {game.status}
                  </span>
                </header>
                <div className="mt-4 space-y-3">
                  {[game.away, game.home].map((team, idx) => (
                    <div key={team.name} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-display text-lg text-white">
                          {idx === 1 ? "vs " : ""}{team.name}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-neutral-500">({team.record})</span>
                      </div>
                      <span
                        className={`font-numeric text-3xl font-bold text-white ${
                          game.updated && idx === 0 ? "animate-score-pulse text-neon-emerald" : ""
                        }`}
                      >
                        {team.score}
                      </span>
                    </div>
                  ))}
                </div>
                <footer className="mt-4 flex items-center justify-between rounded-xl border border-ash/60 bg-graphite/70 px-3 py-2 text-xs text-neutral-400">
                  <span>Line · <span className="font-numeric text-sm text-neutral-100">{game.line}</span></span>
                  <span>Total · <span className="font-numeric text-sm text-neutral-100">{game.total}</span></span>
                </footer>
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-ash/70 bg-graphite/50 p-6">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">Spotlight Reel</h2>
              <span className="text-xs uppercase tracking-[0.24em] text-neutral-500">Curated</span>
            </header>
            <div className="mt-4 space-y-4">
              {highlightClips.map((clip) => (
                <button
                  key={clip.title}
                  className="group flex w-full items-center gap-4 rounded-2xl border border-transparent bg-iron/70 px-4 py-3 text-left transition hover:border-neon-emerald/60"
                >
                  <span className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-ash via-graphite to-iron text-xs uppercase text-neutral-400">
                    <span className="absolute h-full w-full rounded-xl bg-[radial-gradient(circle_at_top,_rgba(45,229,185,0.35),transparent)] opacity-0 transition group-hover:opacity-100" />
                    {clip.duration}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium text-sm text-neutral-100">{clip.title}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-neutral-500">{clip.tag}</p>
                  </div>
                  <span className="text-neon-emerald opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100">
                    ➜
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-ash/70 bg-graphite/40 p-6">
            <header className="flex items-center justify-between">
              <h2 className="font-display text-xl text-white">Hot Takes Trending</h2>
              <Link
                href="/hot-takes"
                className="text-xs uppercase tracking-[0.28em] text-neon-emerald transition hover:text-white"
              >
                View All
              </Link>
            </header>
            <div className="mt-4 space-y-4">
              {hotTakePreviews.map((take) => (
                <div
                  key={take.author}
                  className="rounded-2xl border border-ash/50 bg-iron/70 px-4 py-4 transition hover:border-neon-emerald/60"
                >
                  <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-neutral-500">
                    <span className="h-2 w-2 rounded-full bg-neon-emerald/70" />
                    @{take.author}
                  </div>
                  <p className="mt-3 text-sm italic text-neutral-200">{take.take}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-neutral-500">
                    <span>Reactions · <span className="font-numeric text-sm text-neutral-100">{take.reactions}</span></span>
                    <span>Replies · <span className="font-numeric text-sm text-neutral-100">{take.replies}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4 rounded-3xl border border-ash/70 bg-graphite/60 p-6">
          <header className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-white">Columnists’ Desk</h2>
            <Link href="/columnists" className="text-xs uppercase tracking-[0.28em] text-neutral-500 hover:text-neon-emerald">
              Explore
            </Link>
          </header>
          <div className="grid gap-3 md:grid-cols-2">
            {columnistSpotlight.map((writer) => (
              <article
                key={writer.name}
                className="rounded-2xl border border-ash/60 bg-iron/70 p-5 transition hover:border-neon-blue/60"
              >
                <span className="text-[10px] uppercase tracking-[0.32em] text-neutral-500">{writer.pill}</span>
                <h3 className="mt-3 font-display text-xl text-white">{writer.headline}</h3>
                <p className="mt-4 text-xs uppercase tracking-[0.22em] text-neutral-500">{writer.name}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-ash/70 bg-gradient-to-br from-graphite via-iron to-midnight p-6">
          <header className="space-y-2">
            <span className="text-xs uppercase tracking-[0.32em] text-neutral-500">Fan Reels</span>
            <h2 className="font-display text-2xl text-white">Bring the Arena Noise</h2>
          </header>
          <p className="mt-3 text-sm text-neutral-300">
            Upload vertical hype clips straight from the venue. The best get featured nightly across i65.
          </p>
          <Link
            href="/reels"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-neon-emerald/60 bg-graphite/60 px-5 py-2 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:border-neon-emerald hover:text-white"
          >
            Start Recording
            <span className="text-base leading-none">↗</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
