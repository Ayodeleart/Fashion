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
export default function Hero({ looks, brandPrefix, brandSuffix, tagline }: Props) {
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
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-10 py-6 text-paper z-20">
        <div className="flex gap-6 text-sm">
          <button className="hover:text-brass transition-colors">Catalog</button>
          <button className="hover:text-brass transition-colors">About</button>
        </div>
        <button className="text-sm hover:text-brass transition-colors">Cart</button>
      </nav>

      {/* Wordmark sits BEHIND the image cutouts. Sized with clamp() so it
          always fits the viewport width on one line — shrinks fluidly on
          narrow screens instead of wrapping or overflowing. */}
      <h1
        className="font-display absolute top-[9%] md:top-[16%] left-1/2 -translate-x-1/2 text-white leading-none tracking-tight select-none whitespace-nowrap z-0"
        style={{ fontSize: "clamp(2.2rem, 15vw, 9rem)" }}
      >
        {brandPrefix}
        <span style={{ color: "#c9a253" }}>{brandSuffix}</span>
      </h1>

      {/* Image cutouts — z-10, above the wordmark. Desktop: up to 3 side
          by side. Mobile: middle image only, zoomed in tighter so it
          crosses over the wordmark the same way the desktop layout does
          (legs/torso breaking up the letters), instead of floating in
          a gap above it. */}
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
          className="h-[108%] md:h-[92%] w-auto object-contain object-bottom"
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
