import Link from "next/link";

const featuredColumnists = [
  {
    name: "Sideline Scribe",
    role: "Lead Columnist",
    bio: "Locker-room access. Weekly breakdowns from the Colts tunnel.",
    headline: "Game-Day Mindset: How Underdogs Upset Favorites",
  },
  {
    name: "Numbers Lab",
    role: "Analytics Desk",
    bio: "Advanced metrics and lineup trends to game the moneyline.",
    headline: "Why Indiana’s perimeter defense is quietly elite",
  },
  {
    name: "Court Vision",
    role: "Film Study",
    bio: "Frame-by-frame execution reports for basketball lifers.",
    headline: "Pacers’ weak-side rotations are a playoff cheat code",
  },
  {
    name: "Press Row",
    role: "Feature Writer",
    bio: "Storytelling for the die-hard midwest sports community.",
    headline: "Friday Night Lights, Indy edition: prep standouts to watch",
  },
];

export default function ColumnistsPage() {
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight p-8 shadow-surface">
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Voices of i65</p>
        <h1 className="mt-3 font-display text-4xl text-white">Columnists</h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400">
          Daily columns, film studies, and analytics from our locked-in staff. Follow your favorite writers and reply straight from the article view.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ash/60 bg-graphite/60 px-4 py-2 text-xs uppercase tracking-[0.32em] text-neutral-400">
          Newsletter drops each Sunday at 9AM · Set your alerts
        </div>
      </header>

      <section className="grid gap-5 md:grid-cols-2">
        {featuredColumnists.map((columnist) => (
          <article
            key={columnist.name}
            className="flex flex-col gap-5 rounded-3xl border border-ash/60 bg-graphite/60 p-6 transition hover:border-neon-blue/60 hover:shadow-glow-blue"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">{columnist.role}</p>
                <h2 className="mt-2 font-display text-2xl text-white">{columnist.name}</h2>
              </div>
              <span className="rounded-full border border-ash/60 bg-iron/60 px-3 py-1 text-[10px] uppercase tracking-[0.32em] text-neutral-400">
                Weekly
              </span>
            </div>
            <p className="text-sm text-neutral-300">{columnist.bio}</p>
            <div className="rounded-2xl border border-ash/60 bg-iron/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.32em] text-neutral-500">Latest Headline</p>
              <p className="mt-2 font-display text-lg text-white">{columnist.headline}</p>
              <Link
                href="#"
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:text-white"
              >
                Read Preview
                <span className="text-base leading-none">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
