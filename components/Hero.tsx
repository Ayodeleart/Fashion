"use client";

import { useState, useEffect } from "react";

export type HeroBanner = {
  id: string;
  imageUrl: string;
  href?: string | null;
  label?: string | null;
  subtitle?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
};

type Props = {
  desktopBanners: HeroBanner[];
  mobileBanners: HeroBanner[];
};

/**
 * Desktop and mobile hero banners are completely independent lists —
 * uploaded separately in /admin/hero, stored as separate rows tagged by
 * device. There is NO fallback substitution between them: if only a
 * mobile banner exists, desktop shows nothing (not the mobile image
 * stretched), and vice versa. Which one renders is controlled by CSS
 * media queries (hidden md:block / block md:hidden) rather than a JS
 * viewport check, so there's no flash-of-wrong-image on load.
 *
 * Multiple banners in either list auto-rotate on a timer with a
 * crossfade transition — no manual dots/controls.
 */
export default function Hero({ desktopBanners, mobileBanners }: Props) {
  if (desktopBanners.length === 0 && mobileBanners.length === 0) return null;

  return (
    <>
      {desktopBanners.length > 0 && (
        <div className="hidden md:block">
          <BannerCarousel banners={desktopBanners} showOverlay />
        </div>
      )}
      {mobileBanners.length > 0 && (
        <div className="block md:hidden">
          <BannerCarousel banners={mobileBanners} showOverlay />
        </div>
      )}
    </>
  );
}

function BannerCarousel({ banners, showOverlay }: { banners: HeroBanner[]; showOverlay: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* Scrim behind the nav so it stays legible regardless of which
          banner (or how light/busy) is behind it — a permanent subtle
          gradient, not a color swap. */}
      <div className="absolute top-0 left-0 right-0 h-32 z-10 bg-gradient-to-b from-black/45 to-transparent pointer-events-none" />
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-end px-6 md:px-12 py-6 md:py-8 text-paper z-20">
        <a href="/catalog" className="text-sm tracking-wide hover:text-brass transition-colors">Shop</a>
      </nav>

      {banners.map((b, i) => {
        const isActive = i === activeIndex;
        const content = (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={b.imageUrl}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
            className="w-full h-full object-cover"
          />
        );
        return (
          <div
            key={b.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? "opacity-100 z-0" : "opacity-0 -z-10 pointer-events-none"
            }`}
          >
            {b.href ? <a href={b.href} className="block w-full h-full">{content}</a> : content}
          </div>
        );
      })}

      {/* Tagline overlay — eyebrow + heading + one quiet CTA into Shop.
          Deliberately minimal: no marketing paragraph, no oversized
          button — this is a magazine cover, not a landing-page hero. */}
      {showOverlay && (
        <div className="absolute bottom-0 left-0 right-0 z-10 pt-24 pb-8 md:pb-12 px-6 md:px-12 bg-gradient-to-t from-black/55 to-transparent pointer-events-none">
          <div className="max-w-md pointer-events-auto">
            <p className="text-paper text-xs md:text-sm tracking-[0.15em] uppercase mb-3">
              Craftsmanship. Culture. Distinction.
            </p>
            <h2 className="font-display text-2xl md:text-4xl text-paper mb-4 leading-tight">
              Tailored for how you actually move.
            </h2>
            <a
              href="/catalog"
              className="inline-block text-xs md:text-sm tracking-wide text-paper border border-paper/70 px-5 py-2.5 rounded-sm hover:bg-paper hover:text-ink transition-colors"
            >
              Shop the Collection
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
