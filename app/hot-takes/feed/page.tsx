"use client";

import { useEffect, useState } from "react";
import HotTakeCard from "@/app/components/HotTakeCard";
import Link from "next/link";

type HotTake = {
  id: string;
  videoUrl: string;
  duration: number;
  createdAt: string;
  recordedAtVenue: boolean;
  venueName?: string | null;
  author: {
    username: string;
    role: string;
  };
  _count: {
    comments: number;
    reactions: number;
  };
};

export default function HotTakesFeedPage() {
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHotTakes = async () => {
      try {
        const response = await fetch("/api/hot-takes?limit=20");
        const data = await response.json();
        setHotTakes(data.hotTakes || []);
      } catch (err) {
        console.error("[feed] Failed to fetch hot takes:", err);
        setError("Failed to load hot takes");
      } finally {
        setLoading(false);
      }
    };

    fetchHotTakes();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight via-graphite to-midnight">
      {/* Header */}
      <header className="border-b border-ash/40 bg-midnight/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-neon-emerald to-emerald-600">
                <span className="text-lg font-black text-midnight">i65</span>
              </div>
            </Link>
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              Hot Takes Feed
            </h1>
          </div>

          <Link
            href="/hot-takes"
            className="rounded-full border border-neon-emerald/60 bg-graphite/80 px-4 py-2 text-sm uppercase tracking-wider text-neon-emerald transition hover:bg-neon-emerald hover:text-midnight"
          >
            Record Your Take
          </Link>
        </div>
      </header>

      {/* Feed */}
      <main className="container mx-auto px-4 py-8">
        {loading && (
          <div className="text-center py-12">
            <p className="text-neutral-400">Loading hot takes...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-12">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {!loading && !error && hotTakes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-neutral-400 mb-4">No hot takes yet!</p>
            <Link
              href="/hot-takes"
              className="inline-block rounded-full border border-neon-emerald/60 bg-graphite/80 px-6 py-3 text-sm uppercase tracking-wider text-neon-emerald transition hover:bg-neon-emerald hover:text-midnight"
            >
              Be the First to Record
            </Link>
          </div>
        )}

        {!loading && !error && hotTakes.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {hotTakes.map((hotTake) => (
              <HotTakeCard key={hotTake.id} hotTake={hotTake} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

