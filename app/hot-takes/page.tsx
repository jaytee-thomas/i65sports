import { Suspense } from "react";
import HotTakeRecorder from "../components/HotTakeRecorder";
import HotTakeComposer from "./HotTakeComposer";
import HotTakeFeed from "./HotTakeFeed";

export default function HotTakesPage() {
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight p-8 shadow-surface">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Community Board</p>
            <h1 className="mt-3 font-display text-4xl text-white">Daily Hot Takes</h1>
            <p className="mt-4 max-w-2xl text-sm text-neutral-400">
              60 seconds to make your case. Columnists drop first, fans follow, and the best replies rise to the top.
            </p>
          </div>
          <div className="rounded-full border border-neon-emerald/50 bg-graphite/60 px-4 py-2 text-xs uppercase tracking-[0.32em] text-neon-emerald">
            Tonight’s slate · Colts vs Bears · Pacers vs Celtics
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Suspense
            fallback={
              <div className="rounded-3xl border border-ash/60 bg-graphite/60 p-6 text-sm text-neutral-400">
                Loading the latest takes…
              </div>
            }
          >
            <HotTakeFeed />
          </Suspense>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-ash/60 bg-graphite/60 p-6">
            <h2 className="font-display text-xl text-white">Publish a Text Take</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Share a quick opinion while we wire up video uploads. Picks, predictions, instant reactions — all welcome.
            </p>
            <div className="mt-5">
              <HotTakeComposer />
            </div>
          </div>
          <div className="rounded-3xl border border-ash/60 bg-graphite/60 p-6">
            <h2 className="font-display text-xl text-white">Record a Hot Take</h2>
            <p className="mt-2 text-sm text-neutral-400">
              60 seconds max. Hype your team, call an upset, or react to another take. Replies can drop in video soon.
            </p>
            <div className="mt-5 rounded-2xl border border-dashed border-ash/60 bg-iron/60 p-4">
              <HotTakeRecorder />
            </div>
          </div>
          <div className="rounded-3xl border border-ash/40 bg-graphite/40 p-5 text-xs uppercase tracking-[0.32em] text-neutral-500">
            Publishing flow coming soon — recordings stay local for now.
          </div>
        </aside>
      </div>
    </div>
  );
}
