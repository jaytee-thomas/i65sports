"use client";

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "./ToastProvider";
import { checkRecordingQuota, saveRecordingDraft } from "../hot-takes/recorder-actions";

type Quota = {
  allowed: boolean;
  remaining: number;
  limit: number;
};

function RecorderInner() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef<number | null>(null);

  const [streamReady, setStreamReady] = useState(false);
  const [recording, setRecording] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quota, setQuota] = useState<Quota | null>(null);
  const [quotaError, setQuotaError] = useState<string | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(true);
  const [savingDraft, setSavingDraft] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { pushToast } = useToast();

  const refreshQuota = useCallback(async () => {
    try {
      setIsCheckingQuota(true);
      const result = await checkRecordingQuota();
      setQuota(result);
      setQuotaError(null);
      return result;
    } catch (err) {
      console.error("[recorder] quota check failed", err);
      setQuotaError("Unable to verify recording quota. Try again in a moment.");
      return { allowed: false, remaining: 0, limit: 0 };
    } finally {
      setIsCheckingQuota(false);
    }
  }, []);

  useEffect(() => {
    refreshQuota();
  }, [refreshQuota]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const stopRecording = useCallback(() => {
    setRecording(false);
    mediaRecorderRef.current?.stop();
  }, []);
  
  useEffect(() => {
    let timer: number | undefined;
    if (recording && countdown > 0) {
      timer = window.setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    if (recording && countdown === 0) {
      stopRecording();
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [recording, countdown, stopRecording]);

  const handleRecordingComplete = useCallback(
    async (blob: Blob) => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);

      setSavingDraft(true);
      const durationSeconds =
        startedAtRef.current === null ? Math.round(blob.size / (1024 * 512)) : Math.max(1, Math.round((Date.now() - startedAtRef.current) / 1000));
      
      try {
        // First check quota by saving draft metadata
        const quotaResult = await saveRecordingDraft({
          duration: durationSeconds,
          sizeBytes: blob.size,
          mimeType: blob.type,
        });

        if (!quotaResult.success) {
          pushToast({
            title: "Upload failed",
            description: quotaResult.error ?? "Daily recording limit reached.",
            variant: "error",
          });
          setSavingDraft(false);
          return;
        }

        // Upload to R2
        const formData = new FormData();
        formData.append("video", blob, `hottake-${Date.now()}.webm`);
        formData.append("duration", durationSeconds.toString());
        formData.append("recordedAtVenue", "false"); // Will add venue detection later
        
        // Get user's location if available
        if (navigator.geolocation) {
          try {
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
            });
            formData.append("venueLat", position.coords.latitude.toString());
            formData.append("venueLng", position.coords.longitude.toString());
          } catch (geoErr) {
            console.log("[recorder] geolocation unavailable", geoErr);
          }
        }

        const uploadResponse = await fetch("/api/hot-takes/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed: ${uploadResponse.status}`);
        }

        const uploadResult = await uploadResponse.json();

        if (uploadResult.success) {
          pushToast({
            title: "Hot Take uploaded! 🔥",
            description: "Your take is live and ready for the world to see.",
            variant: "success",
          });
          
          // Clear preview after successful upload
          if (url) {
            URL.revokeObjectURL(url);
          }
          setPreviewUrl(null);
          
          setQuota((prev) => ({
            allowed: (quotaResult.remaining ?? 0) > 0,
            remaining: Math.max(quotaResult.remaining ?? 0, 0),
            limit: prev?.limit ?? 5,
          }));
        } else {
          pushToast({
            title: "Upload failed",
            description: uploadResult.error ?? "Something went wrong uploading your take.",
            variant: "error",
          });
        }
      } catch (err) {
        console.error("[recorder] upload failed", err);
        pushToast({
          title: "Upload failed",
          description: "Something went wrong uploading your take. Please try again.",
          variant: "error",
        });
      } finally {
        setSavingDraft(false);
      }
    },
    [previewUrl, pushToast],
  );

  const startRecording = useCallback(async () => {
    if (recording || savingDraft) return;

    const currentQuota = quota ?? (await refreshQuota());
    if (!currentQuota.allowed) {
      pushToast({
        title: "Daily limit reached",
        description: "You've hit the recording limit for today. Come back tomorrow with more takes.",
        variant: "error",
      });
      return;
    }

    try {
      if (!streamRef.current) {
        const obtainedStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = obtainedStream;
        setStreamReady(true);
        if (videoRef.current) {
          videoRef.current.srcObject = obtainedStream;
        }
      }
      setError(null);
    } catch (e) {
      console.error("[recorder] permission error", e);
      setError("Camera/Mic permission denied or unavailable.");
      pushToast({
        title: "Unable to start recording",
        description: "Allow camera and microphone access to record your take.",
        variant: "error",
      });
      return;
    }

    const activeStream = streamRef.current;
    if (!activeStream) return;

    chunksRef.current = [];
    const recorder = new MediaRecorder(activeStream, { mimeType: "video/webm;codecs=vp9,opus" });
    mediaRecorderRef.current = recorder;
    startedAtRef.current = Date.now();
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      handleRecordingComplete(blob);
    };
    setCountdown(60);
    setRecording(true);
    recorder.start(1000);
  }, [recording, savingDraft, quota, refreshQuota, pushToast, handleRecordingComplete]);

  return (
    <>
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
            className="inline-flex items-center gap-2 rounded-full border border-neon-emerald/60 bg-graphite/80 px-5 py-2 text-xs uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isCheckingQuota || savingDraft || (quota !== null && !quota.allowed)}
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
          {recording ? `⏱ ${countdown}s` : streamReady ? "Ready" : "Idle"}
        </span>
        {quota && (
          <span className="text-xs uppercase tracking-[0.28em] text-neutral-500">
            {quota.remaining}/{quota.limit} recordings left today
          </span>
        )}
        {savingDraft && (
          <span className="text-xs uppercase tracking-[0.28em] text-neon-emerald animate-pulse">
            Uploading...
          </span>
        )}
      </div>
      {quotaError && (
        <p className="rounded-2xl border border-yellow-700/60 bg-yellow-900/30 px-4 py-2 text-sm text-yellow-100">
          {quotaError}
        </p>
      )}
      {error && (
        <p className="rounded-2xl border border-red-700/60 bg-red-900/20 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}
      {previewUrl && (
        <div className="space-y-3 rounded-3xl border border-ash/60 bg-graphite/70 p-4">
          <video 
            src={previewUrl} 
            controls 
            className="w-full max-h-96 rounded-2xl border border-ash/60 object-cover"
          />
          <p className="text-xs uppercase tracking-[0.28em] text-neutral-500">
            Preview - uploading to R2...
          </p>
        </div>
      )}
    </>
  );
}

export default function HotTakeRecorder() {
  return (
    <div className="space-y-4">
      <SignedOut>
        <div className="space-y-3 rounded-3xl border border-ash/60 bg-graphite/70 p-4 text-center text-sm text-neutral-400">
          <p>Sign in to record your hot take with video.</p>
          <SignInButton mode="modal">
            <button className="w-full rounded-full border border-neon-emerald/60 bg-graphite/80 px-5 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-neon-emerald transition hover:-translate-y-0.5 hover:text-white">
              Sign in to record
            </button>
          </SignInButton>
        </div>
      </SignedOut>
      <SignedIn>
        <RecorderInner />
      </SignedIn>
    </div>
  );
}
