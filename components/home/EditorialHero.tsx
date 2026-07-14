"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

export type EditorialHeroLook = {
  id: string;
  image: string;
  label: string;
  mediaType: "image" | "video";
  videoUrl?: string | null;
  promoText?: string | null;
  ctaText?: string;
  ctaHref?: string;
};

/**
 * Full first-viewport moment. Deliberately not a "banner" — one image
 * or muted video, one line of type, one CTA. Subtle parallax on scroll
 * for the image variant, disabled under prefers-reduced-motion. Video
 * renders separately from the image path — no parallax transform on it,
 * just plays.
 */
export default function EditorialHero({ look }: { look: EditorialHeroLook }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const isVideo = look.mediaType === "video" && look.videoUrl;

  useEffect(() => {
    if (isVideo) return; // no parallax on video
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const rect = wrapRef.current?.getBoundingClientRect();
        if (rect) setOffset(rect.top * 0.25);
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isVideo]);

  return (
    <section ref={wrapRef} className="relative h-[calc(100dvh-34px)] w-full overflow-hidden bg-ink">
      {isVideo ? (
        <video
          src={look.videoUrl ?? undefined}
          poster={look.image}
          muted
          autoPlay
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div
          className="absolute inset-0"
          style={{ transform: `translateY(${offset}px)`, transition: "transform 60ms linear" }}
        >
          <Image
            src={look.image}
            alt={look.label}
            fill
            priority
            className="object-cover scale-[1.08]"
            sizes="100vw"
          />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />

      <div className="relative h-full flex flex-col items-start justify-end px-6 md:px-14 pb-16 md:pb-20 max-w-3xl">
        <p className="text-paper/70 text-[11px] tracking-[0.2em] uppercase font-body mb-4">
          The Edit
        </p>
        <h1 className="font-display text-paper text-5xl md:text-7xl leading-[0.95] mb-8">
          {look.promoText ?? look.label}
        </h1>
        {look.ctaText && look.ctaHref && (
          <Link
            href={look.ctaHref}
            className="inline-flex items-center gap-2 text-paper text-sm tracking-[0.05em] uppercase border-b border-paper/50 pb-1 hover:border-paper transition-colors"
          >
            {look.ctaText}
          </Link>
        )}
      </div>
    </section>
  );
}
