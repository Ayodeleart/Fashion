"use client";

import { useState } from "react";

export type HeroBanner = {
  id: string;
  imageUrl: string;
  href?: string | null;
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
 * No auto-slide — multiple banners in either list navigate via manual
 * dots with a crossfade transition.
 */
export default function Hero({ desktopBanners, mobileBanners }: Props) {
  if (desktopBanners.length === 0 && mobileBanners.length === 0) return null;

  return (
    <>
      {desktopBanners.length > 0 && (
        <div className="hidden md:block">
          <BannerCarousel banners={desktopBanners} />
        </div>
      )}
      {mobileBanners.length > 0 && (
        <div className="block md:hidden">
          <BannerCarousel banners={mobileBanners} />
        </div>
      )}
    </>
  );
}

function BannerCarousel({ banners }: { banners: HeroBanner[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full h-screen overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 text-paper z-20">
        <div className="flex gap-8 text-sm tracking-wide">
          <a href="/catalog" className="hover:text-brass transition-colors">Catalog</a>
          <a href="/about" className="hover:text-brass transition-colors">About</a>
        </div>
        <a href="/cart" className="text-sm tracking-wide hover:text-brass transition-colors">Cart</a>
      </nav>

      {banners.map((b, i) => {
        const content = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
        );
        return (
          <div
            key={b.id}
            className="absolute inset-0 z-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ opacity: i === activeIndex ? 1 : 0, pointerEvents: i === activeIndex ? "auto" : "none" }}
          >
            {b.href ? <a href={b.href} className="block w-full h-full">{content}</a> : content}
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
