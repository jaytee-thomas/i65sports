'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-graphite border-l border-ash/40 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation menu"
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-ash/40">
          <span className="text-lg font-bold text-white">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-ash/20 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col p-4 space-y-2">
          <Link
            href="/"
            onClick={onClose}
            className="px-4 py-3 text-white hover:text-neon-emerald hover:bg-ash/20 rounded-lg transition-all duration-200 font-medium"
          >
            Home
          </Link>
          <Link
            href="/hot-takes"
            onClick={onClose}
            className="px-4 py-3 text-white hover:text-neon-emerald hover:bg-ash/20 rounded-lg transition-all duration-200 font-medium"
          >
            Hot Takes
          </Link>
          <Link
            href="/highlights"
            onClick={onClose}
            className="px-4 py-3 text-white hover:text-neon-emerald hover:bg-ash/20 rounded-lg transition-all duration-200 font-medium"
          >
            Highlights
          </Link>
          <Link
            href="/columnists"
            onClick={onClose}
            className="px-4 py-3 text-white hover:text-neon-emerald hover:bg-ash/20 rounded-lg transition-all duration-200 font-medium"
          >
            Columnists
          </Link>
          <Link
            href="/odds"
            onClick={onClose}
            className="px-4 py-3 text-white hover:text-neon-emerald hover:bg-ash/20 rounded-lg transition-all duration-200 font-medium"
          >
            Live Odds
          </Link>

          {/* Divider */}
          <div className="border-t border-ash/40 my-4" />

          {/* CTA Button */}
          <Link
            href="/hot-takes/upload"
            onClick={onClose}
            className="px-4 py-3 bg-gradient-to-r from-neon-emerald to-emerald-600 text-midnight font-bold rounded-lg hover:shadow-lg hover:shadow-neon-emerald/50 transition-all duration-200 text-center"
          >
            Upload Hot Take
          </Link>
        </nav>
      </div>
    </>
  );
}
