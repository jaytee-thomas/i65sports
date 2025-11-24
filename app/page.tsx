import EnhancedOddsTicker from "./components/EnhancedOddsTicker";
import MobileMenu from "./components/MobileMenu";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-graphite to-midnight">
      {/* Header - Mobile Optimized with Hamburger */}
      <header className="sticky top-0 z-50 border-b border-ash/40 bg-midnight/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-neon-emerald to-emerald-600">
              <span className="text-lg md:text-xl font-black text-midnight">i65</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">
              Sports
            </h1>
          </Link>
          
          {/* Desktop Nav */}
          <nav className="hidden md:flex gap-6 lg:gap-8">
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

          {/* Right side: Live badge, Hamburger, Profile */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full border border-live-green/40 bg-graphite px-2 py-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-live-green/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-green" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-live-green">
                Live
              </span>
            </div>

            {/* Mobile Menu */}
            <MobileMenu />
            
            <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-iron">
              <span className="text-xs md:text-sm font-bold text-neon-emerald">J</span>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Odds Ticker */}
      <EnhancedOddsTicker />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="space-y-10 md:space-y-12">
          {/* Hero Section - Mobile Optimized */}
          <section className="text-center">
            <h2 className="mb-3 md:mb-4 text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              Live Sports, <span className="text-hot-pink">Hot Takes</span>
            </h2>
            <p className="mx-auto max-w-2xl text-base md:text-lg text-text-secondary px-4">
              Your home for real-time sports highlights, fan reactions, expert analysis, and live betting odds.
            </p>
            
            {/* CTA Buttons - Mobile Stacked */}
            <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 px-4">
              <Link
                href="/hot-takes"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-hot-pink px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wider text-white transition hover:scale-105 hover:shadow-lg hover:shadow-hot-pink/20 active:scale-95"
              >
                Record Hot Take
                <span className="text-lg md:text-xl">🔥</span>
              </Link>
              
              <Link
                href="/hot-takes/feed"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border-2 border-neon-emerald/40 bg-transparent px-6 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold uppercase tracking-wider text-neon-emerald transition hover:bg-neon-emerald/10 active:scale-95"
              >
                Browse Takes
              </Link>
            </div>
          </section>

          {/* Feature Grid - Mobile 1 column, Tablet 2, Desktop 4 */}
          <section className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/highlights"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-5 md:p-6 transition hover:border-neon-emerald/50 active:scale-95"
            >
              <h3 className="mb-2 text-lg md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald transition">
                Highlights
              </h3>
              <p className="text-sm text-text-secondary">
                Catch the best plays in 30 seconds or less
              </p>
            </Link>

            <Link
              href="/hot-takes"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-5 md:p-6 transition hover:border-hot-pink/50 active:scale-95"
            >
              <h3 className="mb-2 text-lg md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-hot-pink transition">
                Hot Takes
              </h3>
              <p className="text-sm text-text-secondary">
                60-second fan reactions from the stands
              </p>
            </Link>

            <Link
              href="/reels"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-5 md:p-6 transition hover:border-neon-emerald/50 active:scale-95"
            >
              <h3 className="mb-2 text-lg md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald transition">
                Fan Reels
              </h3>
              <p className="text-sm text-text-secondary">
                Behind-the-scenes game day content
              </p>
            </Link>

            <Link
              href="/columnists"
              className="group relative overflow-hidden rounded-2xl border border-ash/40 bg-gradient-to-br from-graphite to-iron p-5 md:p-6 transition hover:border-neon-emerald/50 active:scale-95"
            >
              <h3 className="mb-2 text-lg md:text-xl font-bold uppercase tracking-tight text-white group-hover:text-neon-emerald transition">
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
