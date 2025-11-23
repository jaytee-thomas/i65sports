"use client";

import { useState, useRef } from "react";

type HotTake = {
  id: string;
  videoUrl: string;
  duration: number;
  createdAt: string;
  recordedAtVenue: boolean;
  venueName?: string | null;
  author: {
    username: string;
    role: string;
  };
  _count: {
    comments: number;
    reactions: number;
  };
};

type HotTakeCardProps = {
  hotTake: HotTake;
};

export default function HotTakeCard({ hotTake }: HotTakeCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  const togglePlay = () => {
    if (!videoRef.current) return;

    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
    setShowControls(true);

    // Hide controls after 2 seconds when playing
    if (!isPlaying) {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  const handleMouseMove = () => {
    if (isPlaying) {
      setShowControls(true);
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current);
      }
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 2000);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-ash bg-gradient-to-br from-graphite via-iron to-midnight transition hover:border-hot-pink/40">
      {/* Video */}
      <div
        className="relative aspect-[9/16] w-full cursor-pointer"
        onClick={togglePlay}
        onMouseMove={handleMouseMove}
      >
        <video
          ref={videoRef}
          src={hotTake.videoUrl}
          className="h-full w-full object-cover"
          loop
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />

        {/* Play/Pause Overlay */}
        {(!isPlaying || showControls) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-[2px] transition">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-hot-pink/90 transition group-hover:scale-110">
              {isPlaying ? (
                // Pause icon
                <svg
                  className="h-8 w-8 text-midnight"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                // Play icon
                <svg
                  className="h-8 w-8 text-midnight"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </div>
          </div>
        )}

        {/* Venue Badge */}
        {hotTake.recordedAtVenue && hotTake.venueName && (
          <div className="absolute left-3 top-3 rounded-full border border-neon-emerald/60 bg-midnight/80 px-3 py-1 backdrop-blur-sm">
            <div className="flex items-center gap-1.5 text-xs">
              <span>📍</span>
              <span className="font-semibold text-neon-emerald">
                {hotTake.venueName}
              </span>
            </div>
          </div>
        )}

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 backdrop-blur-sm">
          <span className="text-xs font-mono text-white">
            {hotTake.duration}s
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        {/* Author */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neon-emerald/20 text-sm font-bold text-neon-emerald">
              {hotTake.author.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                @{hotTake.author.username}
              </div>
              <div className="text-xs text-neutral-500">
                {formatDate(hotTake.createdAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-sm text-neutral-400">
          <button className="flex items-center gap-1.5 transition hover:text-neon-emerald">
            <span>❤️</span>
            <span>{hotTake._count.reactions}</span>
          </button>
          <button className="flex items-center gap-1.5 transition hover:text-neon-emerald">
            <span>💬</span>
            <span>{hotTake._count.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 transition hover:text-neon-emerald">
            <span>🔗</span>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

