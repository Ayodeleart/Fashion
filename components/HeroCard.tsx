"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { HeroBanner } from "@/components/Hero";

const ROTATE_MS = 5000;

export default function HeroCard({ banners }: { banners: HeroBanner[] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (banners.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % banners.length), ROTATE_MS);
    return () => clearInterval(id);
  }, [banners.length]);

  if (banners.length === 0) return null;
  const banner = banners[index];

  const title = banner.label ?? "New Arrivals";
  const watermark = title.split(" ")[0]?.toUpperCase() ?? "STYLE";
  // href is stored as "" (not null) when left blank in the admin form —
  // treat any falsy value as "no link set" so Shop Now never dead-ends.
  const href = banner.href || "/catalog";

  return (
    <section className="px-5 pb-6">
      <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-ink">
        {banners.map((b, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={b.id}
            src={b.imageUrl}
            alt=""
            fetchPriority={i === 0 ? "high" : "auto"}
            loading={i === 0 ? "eager" : "lazy"}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

        <p
          aria-hidden
          className="absolute top-4 left-0 right-0 text-center font-display text-[56px] leading-none text-transparent select-none"
          style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.5)" }}
        >
          {watermark}
        </p>

        {/* Title/CTA panel — bottom of the card, above the dot indicators.
            Moved down from the top: the top is where a model's face
            typically sits in these uploaded photos, so the panel kept
            landing right over it regardless of which photo was used. */}
        <div className="absolute bottom-12 left-6 right-6">
          <div className="inline-block bg-black/25 rounded-2xl px-4 py-3 max-w-full">
            <h1 className="font-display text-3xl text-white leading-tight">{title}</h1>
            <Link
              href={href}
              className="inline-block mt-3 bg-white text-black text-sm font-medium rounded-full px-5 py-2.5"
            >
              Shop now
            </Link>
          </div>
        </div>

        {banners.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
            {banners.map((b, i) => (
              <span
                key={b.id}
                className={`h-1 rounded-full transition-all ${i === index ? "w-5 bg-white" : "w-1.5 bg-white/50"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
