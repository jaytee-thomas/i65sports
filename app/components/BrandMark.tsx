"use client";

import Link from "next/link";

type BrandMarkProps = {
  className?: string;
  showWordmark?: boolean;
};

export default function BrandMark({ className = "", showWordmark = true }: BrandMarkProps) {
  return (
    <Link
      href="/"
      className={`group flex items-center gap-3 text-white transition hover:opacity-100 ${className}`}
      aria-label="i65 Sports home"
    >
      <span className="relative flex items-center gap-2 rounded-full bg-[#0b35a3] px-4 py-2 shadow-glow-blue transition group-hover:shadow-lg">
        <span className="font-display text-2xl font-black leading-none tracking-tight text-white">I</span>
        <svg
          viewBox="0 0 80 64"
          className="h-10 w-12 text-white"
          aria-hidden="true"
        >
          <path
            d="M40 4c-5.5 4.5-12.2 7-19.9 7H7v20.4C7 48.3 20.2 59.6 40 64c19.8-4.4 33-15.7 33-32.6V11h-13.1C52.2 11 45.5 8.5 40 4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <text
            x="40"
            y="44"
            textAnchor="middle"
            fontFamily="var(--font-display)"
            fontWeight="700"
            fontSize="30"
            fill="currentColor"
          >
            65
          </text>
        </svg>
      </span>
      {showWordmark && (
        <span className="font-display text-sm uppercase tracking-[0.4em] text-neutral-200">
          sports
        </span>
      )}
    </Link>
  );
}
