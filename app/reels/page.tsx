import FanReelUploader from "../components/FanReelUploader";

export default function ReelsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Fan Reels</h1>
      <p className="opacity-70">Upload a ≤60s vertical clip from a game you attended.</p>
      {/* Replace "demo-game-id" with a real Game.id after you seed your DB */}
      <FanReelUploader gameId="demo-game-id" />
    </div>
  );
}
