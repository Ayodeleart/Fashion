"use client";

import { useState } from "react";

export type HeroBanner = {
  id: string;
  imageDesktop: string | null;
  imageMobile: string | null;
  href?: string | null;
};

type Props = {
  banners: HeroBanner[];
};

/**
 * Full-bleed designed hero image(s) — brand name, tagline, and any other
 * text is baked into the artwork itself (uploaded via /admin/hero), so
 * this component just displays it responsively. Desktop and mobile
 * images are independent (either can be uploaded alone) — if one is
 * missing for a given banner, the other is used for both breakpoints
 * rather than showing nothing.
 *
 * No auto-slide: multiple banners are navigated manually via the dots,
 * with a crossfade transition between them. Only the top nav is
 * overlaid at runtime — everything else is part of the uploaded image.
 */
export default function Hero({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (banners.length === 0) return null;

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 text-paper z-20">
        <div className="flex gap-8 text-sm tracking-wide">
          <a href="/catalog" className="hover:text-brass transition-colors">Catalog</a>
          <a href="/about" className="hover:text-brass transition-colors">About</a>
        </div>
        <a href="/cart" className="text-sm tracking-wide hover:text-brass transition-colors">Cart</a>
      </nav>

      {/* Crossfade: each banner is its own layer, only the active one is
          opaque. Transition is CSS-only (no JS animation loop), and
          switching only happens on manual dot click — never automatic. */}
      {banners.map((b, i) => {
        const d = b.imageDesktop ?? b.imageMobile!;
        const m = b.imageMobile ?? b.imageDesktop!;
        const content = (
          <picture>
            <source media="(min-width: 768px)" srcSet={d} />
            <img src={m} alt="" className="w-full h-full object-cover" />
          </picture>
        );
        return (
          <div
            key={b.id}
            className="absolute inset-0 z-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? "auto" : "none" }}
          >
            {b.href ? (
              <a href={b.href} className="block w-full h-full">
                {content}
              </a>
            ) : (
              content
            )}
          </div>
        );
      })}

      {banners.length > 1 && (
        <div className="absolute bottom-6 md:bottom-8 left-0 right-0 z-20 flex justify-center gap-2">
          {banners.map((b, i) => (
            <button
              key={b.id}
              onClick={() => setActiveIndex(i)}
              aria-label={`Show banner ${i + 1}`}
              className="w-2 h-2 rounded-full transition-colors"
              style={{ backgroundColor: i === activeIndex ? "rgb(var(--brass))" : "rgba(255,255,255,0.5)" }}
            />
          ))}
        </div>
      )}
    </section>
  );
}
