"use client";

import { useState } from "react";
import Link from "next/link";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex flex-col gap-1.5 p-2"
        aria-label="Menu"
      >
        <span className={`h-0.5 w-6 bg-white transition-transform ${isOpen ? "rotate-45 translate-y-2" : ""}`} />
        <span className={`h-0.5 w-6 bg-white transition-opacity ${isOpen ? "opacity-0" : ""}`} />
        <span className={`h-0.5 w-6 bg-white transition-transform ${isOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <nav className="fixed top-[60px] left-0 right-0 bg-midnight border-b border-ash z-50 md:hidden">
            <div className="flex flex-col p-4 space-y-4">
              <Link
                href="/highlights"
                className="text-base uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald py-2"
                onClick={() => setIsOpen(false)}
              >
                Highlights
              </Link>
              <Link
                href="/hot-takes"
                className="text-base uppercase tracking-wider text-text-secondary transition hover:text-hot-pink py-2"
                onClick={() => setIsOpen(false)}
              >
                Hot Takes
              </Link>
              <Link
                href="/reels"
                className="text-base uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald py-2"
                onClick={() => setIsOpen(false)}
              >
                Fan Reels
              </Link>
              <Link
                href="/columnists"
                className="text-base uppercase tracking-wider text-text-secondary transition hover:text-neon-emerald py-2"
                onClick={() => setIsOpen(false)}
              >
                Columnists
              </Link>
            </div>
          </nav>
        </>
      )}
    </>
  );
}

