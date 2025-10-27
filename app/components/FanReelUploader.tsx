"use client";
import { useRef, useState } from "react";

export default function FanReelUploader({ gameId }: { gameId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) return setErr("Please choose a video file.");
    if (f.size > 250 * 1024 * 1024) return setErr("Max file size is 250MB.");
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onSubmit = async () => {
    if (!file) return;
    setSubmitting(true);
    setErr(null);
    try {
      alert("Upload placeholder — wire this to /api/reels/upload-url and your video provider.");
      setFile(null); setPreview(null);
      inputRef.current && (inputRef.current.value = "");
    } catch (e:any) {
      setErr("Upload failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-dashed border-ash/60 bg-iron/60 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-neutral-500">Game ID</p>
            <p className="mt-1 font-numeric text-sm text-neutral-300">{gameId}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <span className="rounded-full bg-graphite/70 px-3 py-1 uppercase tracking-[0.32em]">
              mp4 · mov · webm
            </span>
            <span className="rounded-full bg-graphite/70 px-3 py-1 uppercase tracking-[0.32em]">
              ≤ 250MB
            </span>
          </div>
        </div>

        <label
          htmlFor="fan-reel-upload"
          className="mt-6 flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight px-6 py-10 text-center transition hover:border-neon-emerald/60 hover:shadow-glow-blue"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full border border-ash/60 bg-graphite text-lg text-neon-emerald">
            ⬆
          </span>
          <div className="space-y-1">
            <p className="font-display text-xl text-white">Drop your reel</p>
            <p className="text-sm text-neutral-400">Click to upload or drag a vertical clip onto this surface.</p>
          </div>
          <input
            id="fan-reel-upload"
            ref={inputRef}
            type="file"
            accept="video/*"
            onChange={onPick}
            className="hidden"
          />
        </label>
      </div>

      {preview && (
        <div className="rounded-3xl border border-ash/60 bg-graphite/70 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.32em] text-neutral-500">Preview</span>
            <button
              className="text-xs uppercase tracking-[0.32em] text-neutral-500 hover:text-neon-emerald"
              onClick={() => {
                setFile(null);
                setPreview(null);
                inputRef.current && (inputRef.current.value = "");
              }}
            >
              Clear
            </button>
          </div>
          <video src={preview} controls className="mt-3 w-full rounded-2xl border border-ash/60" />
        </div>
      )}

      {err && (
        <div className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-3 text-sm text-red-300">
          {err}
        </div>
      )}

      <button
        onClick={onSubmit}
        disabled={!file || submitting}
        type="button"
        className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/60 bg-graphite/80 px-6 py-3 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? "Uploading…" : "Upload Fan Reel"}
        <span className="text-base leading-none">↗</span>
      </button>
    </div>
  );
}
