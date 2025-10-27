"use client";
import { useEffect, useRef, useState } from "react";

export default function HotTakeRecorder() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (e) {
        setError("Camera/Mic permission denied or unavailable.");
      }
    })();
    return () => { stream?.getTracks().forEach(t => t.stop()); };
  }, []);

  useEffect(() => {
    let timer: number | undefined;
    if (recording && countdown > 0) {
      timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    if (recording && countdown === 0) stopRecording();
    return () => { if (timer) clearInterval(timer); };
  }, [recording, countdown]);

  const startRecording = () => {
    if (!stream) return;
    chunksRef.current = [];
    const mr = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp9,opus" });
    mediaRecorderRef.current = mr;
    mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    mr.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setBlobUrl(URL.createObjectURL(blob));
    };
    setCountdown(60);
    setRecording(true);
    mr.start(1000);
  };

  const stopRecording = () => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const upload = async () => {
    if (!blobUrl) return;
    const res = await fetch(blobUrl);
    const blob = await res.blob();
    // placeholder: request signed URL from your backend
    alert("Upload placeholder — wire this to /api/upload-url and your video provider.");
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-3xl border border-ash/60 bg-gradient-to-br from-graphite via-iron to-midnight">
        <div className="relative aspect-[3/4] w-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="h-full w-full rounded-3xl object-cover"
          />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-ash/60 bg-black/40 px-3 py-1 text-xs uppercase tracking-[0.32em] text-neutral-200">
            Live Mic
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon-emerald/70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-neon-emerald" />
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-ash/60 bg-graphite/70 px-4 py-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/60 bg-graphite/80 px-5 py-2 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white"
          >
            Record 60s
            <span className="text-base leading-none">●</span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="inline-flex items-center gap-2 rounded-full border border-red-600/60 bg-red-900/30 px-5 py-2 text-xs uppercase tracking-[0.32em] text-red-300 transition hover:-translate-y-0.5 hover:text-white"
          >
            Stop
            <span className="text-base leading-none">■</span>
          </button>
        )}
        <span className="font-numeric text-sm text-neutral-400">
          {recording ? `⏱ ${countdown}s` : "Ready"}
        </span>
      </div>
      {error && <p className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm text-red-300">{error}</p>}
      {blobUrl && (
        <div className="space-y-3 rounded-3xl border border-ash/60 bg-graphite/70 p-4">
          <video src={blobUrl} controls className="w-full rounded-2xl border border-ash/60" />
          <button
            onClick={upload}
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/60 bg-graphite/80 px-5 py-2 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white"
          >
            Publish
            <span className="text-base leading-none">↗</span>
          </button>
        </div>
      )}
    </div>
  );
}
