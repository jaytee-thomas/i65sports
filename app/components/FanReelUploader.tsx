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
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept="video/*" onChange={onPick} />
      {preview && <video src={preview} controls className="w-full rounded" />}
      {err && <p className="text-red-600">{err}</p>}
      <button
        onClick={onSubmit}
        disabled={!file || submitting}
        className="px-4 py-2 rounded bg-emerald-600 text-white disabled:opacity-50">
        {submitting ? "Uploading..." : "Upload Fan Reel"}
      </button>
    </div>
  );
}
