"use client";
import { useEffect, useRef, useState } from "react";

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

  return (
    <div className="w-full bg-neutral-900 text-white text-sm rounded border border-neutral-800">
      <div className="flex items-center gap-2 px-3 py-1 border-b border-neutral-800">
        <span className="font-semibold">Live Odds</span><span className="opacity-60">Demo</span>
      </div>
      <div ref={scrollerRef} className="overflow-x-scroll whitespace-nowrap no-scrollbar py-2">
        {items.map((it, i) => (
          <span key={i} className="inline-flex items-center gap-2 px-4">
            <span className="opacity-70">{it.league}</span>
            <span>{it.away} @ {it.home}</span>
            {typeof it.spread === "number" && <span>Spread: {it.spread}</span>}
            {typeof it.total === "number" && <span>Total: {it.total}</span>}
            {typeof it.mlHome === "number" && typeof it.mlAway === "number" && (
              <span>ML: {it.mlAway}/{it.mlHome}</span>
            )}
            <span className="opacity-50">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}
