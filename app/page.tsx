import EnhancedOddsTicker from "./components/EnhancedOddsTicker";
import Header from "./components/Header";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background-dark via-background-medium to-background-dark">
      {/* Header Component */}
      <Header />

      {/* Enhanced Odds Ticker */}
      <div className="w-full overflow-hidden">
        <EnhancedOddsTicker />
      </div>

      {/* Hero Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-20 text-center">
        <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black text-text-primary mb-3 sm:mb-4 md:mb-6 leading-tight">
          WHERE SPORTS
          <br />
          <span className="text-accent">COME ALIVE</span>
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-6 sm:mb-8 md:mb-10 px-2">
          Real fans. Real takes. Real-time odds. Experience sports through the
          eyes of the people in the stadium.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
          <Link
            href="/hot-takes"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-accent to-emerald-600 text-background-dark font-bold text-base sm:text-lg rounded-lg hover:shadow-xl hover:shadow-accent/50 transition-all duration-200 text-center"
          >
            Watch Hot Takes
          </Link>
          <Link
            href="/hot-takes/upload"
            className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border-2 border-accent text-accent font-bold text-base sm:text-lg rounded-lg hover:bg-accent/10 transition-all duration-200 text-center"
          >
            Upload Your Take
          </Link>
        </div>
      </section>

      {/* Featured Hot Takes Section - Mobile Optimized */}
      <section className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="flex items-center gap-2 mb-4 sm:mb-6 md:mb-8">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-text-primary">
            TRENDING HOT TAKES
          </h3>
          <span className="text-2xl sm:text-3xl">🔥</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Placeholder cards - replace with actual data */}
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-background-medium border border-border rounded-lg p-4 hover:border-accent/50 transition-all duration-200 cursor-pointer"
            >
              <div className="aspect-video bg-background-light rounded-lg mb-3 flex items-center justify-center">
                <span className="text-text-muted text-sm">Video Player</span>
              </div>
              <h4 className="text-text-primary font-bold mb-2 text-base sm:text-lg">
                Hot Take #{i}
              </h4>
              <p className="text-text-secondary text-xs sm:text-sm">
                Venue • 2.3k views • 45 min ago
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer - Mobile Optimized */}
      <footer className="border-t border-border bg-background-medium mt-12 sm:mt-16 md:mt-20">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-emerald-600">
                <span className="text-sm font-black text-background-dark">i65</span>
              </div>
              <span className="text-sm text-text-secondary">
                © 2025 i65Sports. All rights reserved.
              </span>
            </div>
            <div className="flex gap-4 sm:gap-6 text-sm">
              <Link href="/about" className="text-text-secondary hover:text-accent transition-colors">
                About
              </Link>
              <Link href="/terms" className="text-text-secondary hover:text-accent transition-colors">
                Terms
              </Link>
              <Link href="/privacy" className="text-text-secondary hover:text-accent transition-colors">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
