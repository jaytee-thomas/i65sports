import EnhancedOddsTicker from "./components/EnhancedOddsTicker";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-graphite to-midnight">
      {/* Header */}
      <header className="border-b border-ash/40 bg-midnight/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-emerald to-emerald-600">
              <span className="text-xl font-black text-midnight">i65</span>
            </div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-white">
              Sports
            </h1>
          </div>
          
          <nav className="flex gap-6">
            <Link
              href="/highlights"
              className="text-sm uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald"
            >
              Highlights
            </Link>
            <Link
              href="/hot-takes"
              className="text-sm uppercase tracking-wider text-text-secondary transition hover:text-hot-pink"
            >
              Hot Takes
            </Link>
            <Link
              href="/reels"
              className="text-sm uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald"
            >
              Fan Reels
            </Link>
            <Link
              href="/columnists"
              className="text-sm uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald"
            >
              Columnists
            </Link>
          </nav>
        </div>
      </header>

      {/* Enhanced Odds Ticker */}
      <EnhancedOddsTicker />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {/* Hero Section */}
          <section className="text-center">
            <h2 className="mb-4 text-5xl font-black uppercase tracking-tight text-white">
              Live Sports, <span className="text-hot-pink">Hot Takes</span>
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-text-secondary">
              Your home for real-time sports highlights, fan reactions, expert analysis, and live betting odds.
            </p>
            
            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/hot-takes"
                className="inline-flex items-center gap-2 rounded-full bg-hot-pink px-8 py-4 text-base font-bold uppercase tracking-wider text-white transition hover:scale-105 hover:shadow-lg hover:shadow-hot-pink/20"
              >
                Record Hot Take
                <span className="text-xl">🔥</span>
              </Link>
              
              <Link
                href="/hot-takes/feed"
                className="inline-flex items-center gap-2 rounded-full border-2 border-neon-emerald/40 bg-transparent px-8 py-4 text-base font-bold uppercase tracking-wider text-neon-emerald transition hover:bg-neon-emerald/10"
              >
                Browse Takes
              </Link>
            </div>
          </section>

          {/* Feature Grid */}
          <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/highlights"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-6 transition hover:border-neon-emerald/50"
            >
              <h3 className="mb-2 text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald">
                Highlights
              </h3>
              <p className="text-sm text-text-secondary">
                Catch the best plays in 30 seconds or less
              </p>
            </Link>

            <Link
              href="/hot-takes"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-6 transition hover:border-hot-pink/50"
            >
              <h3 className="mb-2 text-xl font-bold uppercase tracking-tight text-white group-hover:text-hot-pink">
                Hot Takes
              </h3>
              <p className="text-sm text-text-secondary">
                60-second fan reactions from the stands
              </p>
            </Link>

            <Link
              href="/reels"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-6 transition hover:border-neon-emerald/50"
            >
              <h3 className="mb-2 text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald">
                Fan Reels
              </h3>
              <p className="text-sm text-text-secondary">
                Behind-the-scenes game day content
              </p>
            </Link>

            <Link
              href="/columnists"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-6 transition hover:border-neon-emerald/50"
            >
              <h3 className="mb-2 text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald">
                Columnists
              </h3>
              <p className="text-sm text-text-secondary">
                Expert analysis and sports commentary
              </p>
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}
