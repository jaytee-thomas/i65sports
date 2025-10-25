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
    <div className="space-y-3">
      <div className="rounded border border-neutral-800 p-3">
        <video ref={videoRef} autoPlay muted playsInline className="w-full rounded bg-black" />
      </div>
      <div className="flex items-center gap-3">
        {!recording ? (
          <button onClick={startRecording} className="px-4 py-2 rounded bg-black text-white">Record 60s</button>
        ) : (
          <button onClick={stopRecording} className="px-4 py-2 rounded bg-red-600 text-white">Stop</button>
        )}
        <span className="tabular-nums">{recording ? `⏱️ ${countdown}s` : "Ready"}</span>
      </div>
      {error && <p className="text-red-600">{error}</p>}
      {blobUrl && (
        <div className="space-y-2">
          <video src={blobUrl} controls className="w-full rounded" />
          <button onClick={upload} className="px-4 py-2 rounded bg-emerald-600 text-white">Publish</button>
        </div>
      )}
    </div>
  );
}
