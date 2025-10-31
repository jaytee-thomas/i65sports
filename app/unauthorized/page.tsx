"use client";

import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-midnight px-6 text-center text-neutral-200">
      <div className="space-y-6 rounded-3xl border border-ash/60 bg-graphite/80 px-8 py-10 shadow-surface">
        <h1 className="font-display text-3xl text-white">Access denied</h1>
        <p className="max-w-md text-sm text-neutral-400">
          You’re signed in, but this area is limited to specific roles. Reach out to an administrator if you think this is a mistake.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.32em]">
          <Link
            href="/"
            className="rounded-full border border-ash/60 bg-graphite/80 px-5 py-2 text-neutral-300 transition hover:border-neon-emerald/60 hover:text-white"
          >
            Back home
          </Link>
          <SignOutButton redirectUrl="/sign-in">
            <button className="rounded-full border border-ash/60 bg-graphite/80 px-5 py-2 text-neutral-300 transition hover:border-neon-emerald/60 hover:text-white">
              Switch account
            </button>
          </SignOutButton>
        </div>
      </div>
    </main>
  );
}
