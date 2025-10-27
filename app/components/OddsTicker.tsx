"use client";
import { useEffect, useMemo, useRef, useState } from "react";

type TickerItem = { league: string; home: string; away: string; spread?: number; total?: number; mlHome?: number; mlAway?: number; };

export default function OddsTicker() {
  const [items, setItems] = useState<TickerItem[]>([]);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/odds?ticker=1", { cache: "no-store" });
      const data = await res.json();
      setItems(data.items ?? []);
    };
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    let raf: number;
    const step = () => {
      const el = scrollerRef.current;
      if (!el) return;
      el.scrollLeft += 0.8;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth) el.scrollLeft = 0;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [items]);

  const loopedItems = useMemo(() => items.concat(items), [items]);

  return (
    <div className="w-full overflow-hidden rounded-3xl border border-ash/60 bg-graphite/70 text-sm text-neutral-200">
      <div className="flex items-center justify-between border-b border-ash/60 px-4 py-2 text-xs uppercase tracking-[0.32em] text-neutral-500">
        <span className="flex items-center gap-2 text-neutral-300">
          Live Odds Stream
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald/70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald" />
          </span>
        </span>
        <span>Demo Feed</span>
      </div>
      <div ref={scrollerRef} className="no-scrollbar flex overflow-x-scroll py-3">
        <div className="flex items-center">
          {loopedItems.map((it, i) => (
            <span
              key={`${it.league}-${it.home}-${i}`}
              className="mx-3 inline-flex items-center gap-3 rounded-full border border-ash/50 bg-iron/70 px-4 py-2 text-xs uppercase tracking-[0.24em] text-neutral-400"
            >
              <span className="font-numeric text-sm text-neon-emerald">{it.league}</span>
              <span className="text-neutral-200">
                {it.away} <span className="text-neutral-500">@</span> {it.home}
              </span>
              {typeof it.spread === "number" && (
                <span>
                  Spread <span className="font-numeric text-neutral-100">{it.spread}</span>
                </span>
              )}
              {typeof it.total === "number" && (
                <span>
                  Total <span className="font-numeric text-neutral-100">{it.total}</span>
                </span>
              )}
              {typeof it.mlHome === "number" && typeof it.mlAway === "number" && (
                <span>
                  ML <span className="font-numeric text-neutral-100">{it.mlAway}/{it.mlHome}</span>
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
