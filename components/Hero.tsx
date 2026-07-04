"use client";

import { useEffect, useState } from "react";

export type HeroLook = {
  id: string;
  imageLeft?: string | null;   // background-removed PNG/WebP, desktop only
  imageMiddle: string;         // required — the only image shown on mobile
  imageRight?: string | null;  // background-removed PNG/WebP, desktop only
  bgColor: string;             // "r, g, b"
};

type Props = {
  looks: HeroLook[];
  brandPrefix: string; // "AYODELE"
  brandSuffix: string; // "GOLD" — rendered in brass/gold
  tagline: string;     // "fashionista"
  seasonLabel?: string; // e.g. "NEW ARRIVALS" — bottom-left corner, desktop only
  yearLabel?: string;   // e.g. "2026" — bottom-right corner, desktop only
};

/**
 * Static image hero (not video): 1-3 background-removed PNG cutouts sit
 * ABOVE the wordmark, so the brand name reads as "behind" the models
 * through the transparent gaps — no video alpha-matting pipeline needed,
 * this works with any standard background-removed still image. Mobile
 * shows only the middle cutout; desktop shows all three side by side.
 * Multiple "looks" auto-rotate with a crossfade, same as the old video
 * hero, just image-based now.
 */
export default function Hero({
  looks,
  brandPrefix,
  brandSuffix,
  tagline,
  seasonLabel = "NEW ARRIVALS",
  yearLabel = String(new Date().getFullYear()),
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (looks.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % looks.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [looks.length]);

  const look = looks[activeIndex];
  const bgColor = look?.bgColor ?? "22, 48, 42";

  return (
    <section
      className="relative w-full h-[100svh] overflow-hidden flex items-end"
      style={{
        backgroundColor: `rgb(${bgColor})`,
        transition: "background-color 1000ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Nav — Catalog / About only, per the "remove Search & Favorites" note */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 text-paper z-20">
        <div className="flex gap-8 text-sm tracking-wide">
          <button className="hover:text-brass transition-colors">Catalog</button>
          <button className="hover:text-brass transition-colors">About</button>
        </div>
        <button className="text-sm tracking-wide hover:text-brass transition-colors">Cart</button>
      </nav>

      {/* Season / year corner labels — desktop only, echoes the
          "AUTUMN / WINTER ... 2025" treatment on the Norven reference. */}
      <div className="hidden md:flex absolute bottom-8 left-12 right-12 justify-between text-paper/80 text-xs tracking-[0.2em] uppercase z-20 pointer-events-none">
        <span>{seasonLabel}</span>
        <span>{yearLabel}</span>
      </div>

      {/* Wordmark sits BEHIND the image cutouts.
          Desktop: one wide line positioned low so the models' legs
          actually cross through it, matching the reference; sized to
          nearly span the full width.
          Mobile: stacked two lines (one word per line) instead of one
          shrunk line — each word alone is short enough to run much
          bigger while still fitting the screen width, and the two lines
          bracket the model (top word behind the shoulders, bottom word
          behind the legs) the way the desktop version brackets all
          three models. */}
      <h1
        className="hidden md:block font-display absolute top-[60%] left-1/2 -translate-x-1/2 text-white leading-none tracking-tight select-none whitespace-nowrap z-0"
        style={{ fontSize: "clamp(4rem, 12.5vw, 12rem)" }}
      >
        {brandPrefix}
        <span style={{ color: "#c9a253" }}>{brandSuffix}</span>
      </h1>

      <span
        className="md:hidden absolute top-[5%] inset-x-0 text-center font-display text-white leading-none tracking-tight select-none z-0"
        style={{ fontSize: "clamp(3.2rem, 22vw, 6rem)" }}
      >
        {brandPrefix}
      </span>
      <span
        className="md:hidden absolute top-[58%] inset-x-0 text-center font-display leading-none tracking-tight select-none z-0"
        style={{ fontSize: "clamp(3.2rem, 22vw, 6rem)", color: "#c9a253" }}
      >
        {brandSuffix}
      </span>

      {/* Image cutouts — z-10, above the wordmark. Desktop: up to 3 side
          by side. Mobile: middle image only, zoomed in tight so it
          actually crosses over both wordmark lines above (legs/torso
          breaking up the letters), instead of floating in a gap. */}
      <div className="absolute inset-0 z-10 flex items-end justify-center">
        {look?.imageLeft && (
          <img
            src={look.imageLeft}
            alt=""
            className="hidden md:block h-[92%] w-auto object-contain object-bottom -mr-6"
          />
        )}
        <img
          src={look?.imageMiddle}
          alt=""
          className="h-[145%] md:h-[92%] w-auto object-contain object-bottom"
        />
        {look?.imageRight && (
          <img
            src={look.imageRight}
            alt=""
            className="hidden md:block h-[92%] w-auto object-contain object-bottom -ml-6"
          />
        )}
      </div>

      {/* Tagline overlays the BOTTOM of the hero, on top of the images. */}
      <div className="relative z-20 w-full pb-6 md:pb-8 flex justify-center pointer-events-none">
        <p
          className="font-display text-paper tracking-[0.25em] uppercase"
          style={{ fontSize: "clamp(0.9rem, 2.4vw, 1.5rem)", textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}
        >
          {tagline}
        </p>
      </div>
    </section>
  );
}
