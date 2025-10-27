import FanReelUploader from "../components/FanReelUploader";

export default function ReelsPage() {
  return (
    <div className="space-y-10">
      <header className="rounded-3xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight p-8 shadow-surface">
        <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Fan Reels</p>
        <h1 className="mt-3 font-display text-4xl text-white">Bring the Arena Noise</h1>
        <p className="mt-4 max-w-2xl text-sm text-neutral-400">
          Upload a 60-second vertical clip straight from the stands. We’ll spotlight the loudest crowds, the best celebrations, and the most creative fan commentary.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-ash/60 bg-graphite/60 px-4 py-2 text-xs uppercase tracking-[0.32em] text-neutral-400">
          Tip · Capture audio to let the atmosphere breathe
        </div>
      </header>
      <div className="rounded-3xl border border-ash/60 bg-graphite/60 p-6">
        <FanReelUploader gameId="demo-game-id" />
      </div>
    </div>
  );
}
