'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import MobileMenu from './MobileMenu';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-background-dark/95 backdrop-blur-sm">
        <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 md:py-4 flex items-center justify-between max-w-7xl">
          {/* Logo - Responsive Sizing */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-gradient-to-br from-accent to-emerald-600 flex-shrink-0">
              <span className="text-sm sm:text-lg md:text-xl font-black text-background-dark">i65</span>
            </div>
            <h1 className="text-base sm:text-xl md:text-2xl font-black uppercase tracking-tight text-text-primary whitespace-nowrap">
              i65<span className="text-accent">Sports</span>
            </h1>
          </Link>

          {/* Desktop Navigation - Hidden on Mobile */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="/"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Home
            </Link>
            <Link
              href="/hot-takes"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Hot Takes
            </Link>
            <Link
              href="/highlights"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Highlights
            </Link>
            <Link
              href="/columnists"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Columnists
            </Link>
            <Link
              href="/odds"
              className="text-text-secondary hover:text-accent transition-colors duration-200 font-medium text-sm lg:text-base"
            >
              Live Odds
            </Link>
            <Link
              href="/hot-takes/upload"
              className="px-3 lg:px-4 py-1.5 lg:py-2 bg-gradient-to-r from-accent to-emerald-600 text-background-dark font-bold rounded-lg hover:shadow-lg hover:shadow-accent/50 transition-all duration-200 text-sm lg:text-base whitespace-nowrap"
            >
              Upload Hot Take
            </Link>
          </nav>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-1.5 sm:p-2 rounded-lg hover:bg-background-medium/50 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-text-secondary" />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
