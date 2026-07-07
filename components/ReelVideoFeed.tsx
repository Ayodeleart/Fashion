"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { SpeakerMutedIcon, SpeakerOnIcon } from "@/components/ReelIcons";
import ReelActionRail from "@/components/ReelActionRail";

export type FeedReel = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  product_slug: string | null;
  product_name: string | null;
  like_count: number;
};

function VideoCard({
  reel,
  muted,
  onToggleMute,
}: {
  reel: FeedReel;
  muted: boolean;
  onToggleMute: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showGlimpse, setShowGlimpse] = useState(false);
  const glimpseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.6 }
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  // Brief center glimpse of the current mute state whenever it changes —
  // mirrors Instagram's tap-to-unmute hint. Plain timeout-driven opacity,
  // not a scroll-linked animation, so it renders fine everywhere (including
  // the 2021 TV, if this page ever gets opened there).
  function flashGlimpse() {
    setShowGlimpse(true);
    if (glimpseTimeout.current) clearTimeout(glimpseTimeout.current);
    glimpseTimeout.current = setTimeout(() => setShowGlimpse(false), 700);
  }

  function handleTap() {
    onToggleMute();
    flashGlimpse();
  }

  return (
    <div className="relative w-full h-full snap-start shrink-0 bg-black">
      <video
        ref={videoRef}
        src={reel.video_url}
        poster={reel.thumbnail_url ?? undefined}
        loop
        muted={muted}
        playsInline
        className="w-full h-full object-cover"
        onClick={handleTap}
      />

      {showGlimpse && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center text-white transition-opacity">
            {muted ? <SpeakerMutedIcon className="w-8 h-8" /> : <SpeakerOnIcon className="w-8 h-8" />}
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-5 right-20 text-white">
        {reel.caption && <p className="text-sm mb-3 drop-shadow">{reel.caption}</p>}
        {reel.product_slug && (
          <Link
            href={`/product/${reel.product_slug}`}
            className="inline-block bg-white text-black text-sm font-medium rounded-full px-4 py-2"
          >
            Shop {reel.product_name}
          </Link>
        )}
      </div>

      <div className="absolute bottom-6 right-4">
        <ReelActionRail reelId={reel.id} initialLikeCount={reel.like_count} caption={reel.caption} />
      </div>

      <button
        onClick={handleTap}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
      >
        {muted ? <SpeakerMutedIcon className="w-4 h-4" /> : <SpeakerOnIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ReelVideoFeed({ reels, startId }: { reels: FeedReel[]; startId: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // One shared mute flag for the whole session, not per-card — the first
  // video starts muted, and unmuting it (or any video) applies to every
  // video for the rest of the session, matching how Instagram reels behave.
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    if (!startId || !containerRef.current) return;
    const target = containerRef.current.querySelector(`[data-reel-id="${startId}"]`);
    target?.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
  }, [startId]);

  return (
    <main ref={containerRef} className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {reels.map((reel) => (
        <div key={reel.id} data-reel-id={reel.id} className="h-screen w-full">
          <VideoCard reel={reel} muted={muted} onToggleMute={() => setMuted((m) => !m)} />
        </div>
      ))}
    </main>
  );
}
