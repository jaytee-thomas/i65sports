"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import HotTakeCard from "./HotTakeCard";

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

export default function MyHotTakes() {
  const { user } = useUser();
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyHotTakes = async () => {
      if (!user) return;

      try {
        const response = await fetch(`/api/hot-takes?userId=${user.id}&limit=10`);
        const data = await response.json();
        setHotTakes(data.hotTakes || []);
      } catch (err) {
        console.error("[my-hot-takes] Failed to fetch:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyHotTakes();
  }, [user]);

  if (loading) {
    return (
      <div className="rounded-3xl border border-ash/60 bg-graphite/70 p-8">
        <p className="text-center text-sm text-neutral-400">Loading your takes...</p>
      </div>
    );
  }

  if (hotTakes.length === 0) {
    return (
      <div className="rounded-3xl border border-ash/60 bg-graphite/70 p-8 text-center">
        <p className="text-neutral-400 mb-2">You haven't recorded any hot takes yet</p>
        <p className="text-xs text-neutral-500">Use the recorder above to share your take!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold uppercase tracking-tight text-white">
          My Hot Takes
        </h2>
        <span className="text-sm text-neutral-500">
          {hotTakes.length} {hotTakes.length === 1 ? "take" : "takes"}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hotTakes.map((hotTake) => (
          <HotTakeCard key={hotTake.id} hotTake={hotTake} />
        ))}
      </div>
    </div>
  );
}

