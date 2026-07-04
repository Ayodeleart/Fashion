"use client";

import { useEffect, useState } from "react";

export type HeroBanner = {
  id: string;
  imageDesktop: string;
  imageMobile: string;
  href?: string | null;
};

type Props = {
  banners: HeroBanner[];
};

/**
 * Full-bleed designed hero image — brand name, tagline, and any other
 * text is baked into the artwork itself (uploaded via /admin/hero), so
 * this component just displays it responsively. Desktop and mobile use
 * separate images via <picture>, since a single image can't usually be
 * cropped well for both a wide desktop viewport and a tall phone one.
 * Only the top nav (Catalog / About / Cart) is overlaid at runtime —
 * everything else is part of the image.
 */
export default function Hero({ banners }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex((i) => (i + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const banner = banners[activeIndex];
  if (!banner) return null;

  const image = (
    <picture>
      <source media="(min-width: 768px)" srcSet={banner.imageDesktop} />
      <img
        src={banner.imageMobile}
        alt=""
        className="w-full h-full object-cover"
      />
    </picture>
  );

  return (
    <section className="relative w-full h-[100svh] overflow-hidden">
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-12 py-6 md:py-8 text-paper z-20">
        <div className="flex gap-8 text-sm tracking-wide">
          <button className="hover:text-brass transition-colors">Catalog</button>
          <button className="hover:text-brass transition-colors">About</button>
        </div>
        <button className="text-sm tracking-wide hover:text-brass transition-colors">Cart</button>
      </nav>

      <div className="absolute inset-0 z-0">
        {banner.href ? (
          <a href={banner.href} className="block w-full h-full">
            {image}
          </a>
        ) : (
          image
        )}
      </div>
    </section>
  );
}
