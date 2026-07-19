"use client";

import Link from "next/link";
import { PlayIcon } from "@/components/ReelIcons";

export type ReelPreview = {
  id: string;
  thumbnailUrl: string | null;
  videoUrl: string;
  categorySlug: string;
};

export default function ReelsPreviewGrid({ reels }: { reels: ReelPreview[] }) {
  if (reels.length === 0) {
    return (
      <div className="py-20 text-center text-sm text-muted">No reels yet — check back soon.</div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 bg-ink">
      {reels.map((reel) => (
        <Link
          key={reel.id}
          href={`/reels/${reel.categorySlug}?start=${reel.id}`}
          className="relative aspect-[3/4] bg-ink"
        >
          {reel.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={reel.thumbnailUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <video src={`${reel.videoUrl}#t=0.1`} className="w-full h-full object-cover" muted playsInline preload="metadata" />
          )}
          <PlayIcon className="absolute bottom-2 right-2 w-5 h-5" />
        </Link>
      ))}
    </div>
  );
}
