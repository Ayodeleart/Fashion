"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { SpeakerMutedIcon, SpeakerOnIcon } from "@/components/ReelIcons";
import ReelActionRail from "@/components/ReelActionRail";

type Reel = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  product_id: string | null;
  product_slug: string | null;
  product_name: string | null;
  like_count: number;
};

type ReelRow = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  product_id: string | null;
  like_count: number;
  ariana_products: { slug: string; name: string } | null;
};

function VideoCard({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
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
  // not a scroll-linked animation, so it renders fine everywhere.
  function flashGlimpse() {
    setShowGlimpse(true);
    if (glimpseTimeout.current) clearTimeout(glimpseTimeout.current);
    glimpseTimeout.current = setTimeout(() => setShowGlimpse(false), 700);
  }

  function toggleMute() {
    setMuted((m) => !m);
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
        onClick={toggleMute}
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
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-5 right-5 w-9 h-9 rounded-full bg-black/40 flex items-center justify-center text-white"
      >
        {muted ? <SpeakerMutedIcon className="w-4 h-4" /> : <SpeakerOnIcon className="w-4 h-4" />}
      </button>
    </div>
  );
}

export default function ReelsPage() {
  const [reels, setReels] = useState<Reel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase
      .from("ariana_reels")
      .select("id, video_url, thumbnail_url, caption, product_id, like_count, ariana_products(slug, name)")
      .eq("status", "published")
      .order("position", { ascending: true })
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        const rows = (data as unknown as ReelRow[]) ?? [];
        setReels(
          rows.map((r) => ({
            id: r.id,
            video_url: r.video_url,
            thumbnail_url: r.thumbnail_url,
            caption: r.caption,
            product_id: r.product_id,
            product_slug: r.ariana_products?.slug ?? null,
            product_name: r.ariana_products?.name ?? null,
            like_count: r.like_count ?? 0,
          }))
        );
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <main className="h-screen flex items-center justify-center bg-black">
        <p className="text-sm text-white/70">Loading reels…</p>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-white/70">No reels yet — check back soon.</p>
      </main>
    );
  }

  return (
    <main className="h-screen w-full overflow-y-scroll snap-y snap-mandatory bg-black">
      {reels.map((reel) => (
        <div key={reel.id} className="h-screen w-full">
          <VideoCard reel={reel} />
        </div>
      ))}
    </main>
  );
}

