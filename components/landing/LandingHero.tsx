"use client";

import type { HeroBanner } from "@/components/Hero";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function HeroPhoto({ banner }: { banner: HeroBanner | null }) {
  return (
    <>
      {banner ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" fetchPriority="high" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-paper/30 text-sm">
          Upload a hero photo in admin
        </div>
      )}
    </>
  );
}

export default function LandingHero({
  desktopBanner,
  mobileBanner,
}: {
  desktopBanner: HeroBanner | null;
  mobileBanner: HeroBanner | null;
}) {
  const ref = useScrollReveal<HTMLElement>(80);

  return (
    <section ref={ref} className="relative bg-ink text-paper overflow-hidden">
      {/* Full-bleed photo reaching the very top of the page — the header
          sits transparent on top of it (see LandingHeader), so nothing
          pushes the image down. Separate mobile/desktop banners, shown
          responsively instead of always using one. */}
      <div className="relative w-full aspect-[3/4] md:aspect-[16/9] bg-ink/40">
        <div className="md:hidden absolute inset-0" data-reveal="image">
          <HeroPhoto banner={mobileBanner} />
        </div>
        <div className="hidden md:block absolute inset-0" data-reveal="image">
          <HeroPhoto banner={desktopBanner} />
        </div>

        {/* Top scrim so the overlaid title stays legible without
            depending on where a face happens to sit in the photo. */}
        <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-black/70 via-black/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Title overlay — top of the photo, clear of center/face area */}
        <div className="absolute top-0 left-0 right-0 px-6 md:px-10 pt-24 md:pt-28 max-w-6xl mx-auto">
          <p className="eyebrow text-paper/70 mb-1" data-reveal="heading">
            AYODELE <span className="text-brass">GOLD</span>
          </p>

          <div className="relative" data-reveal="heading">
            <h1
              className="select-none leading-[0.82] uppercase break-words"
              style={{
                fontFamily: "var(--font-landing-display)",
                fontSize: "clamp(3rem, 12vw, 7rem)",
                WebkitTextStroke: "1px rgba(243,241,236,0.4)",
                color: "transparent",
              }}
              aria-hidden
            >
              Fashionista
            </h1>
            <h1
              className="select-none leading-[0.82] uppercase -mt-[0.78em] relative z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
              style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(3rem, 12vw, 7rem)" }}
            >
              Fashionista
            </h1>
          </div>

          <p className="max-w-xs text-sm text-paper/85 mt-3 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]" data-reveal="paragraph">
            Where fabric meets finesse and creativity meets couture.
          </p>
        </div>

        <svg
          className="absolute left-4 bottom-4 md:left-8 md:bottom-8 opacity-70"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
        >
          <path d="M13 0v26M0 13h26" stroke="#f3f1ec" strokeWidth={1} />
        </svg>

        <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 w-16 h-16 md:w-20 md:h-20">
          <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_16s_linear_infinite]">
            <defs>
              <path id="landing-badge-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
            </defs>
            <circle cx="50" cy="50" r="48" fill="rgba(243,241,236,0.12)" />
            <text fontSize="7.6" fill="#f3f1ec" letterSpacing="1.5">
              <textPath href="#landing-badge-circle" startOffset="0%">
                • DESIGN THAT BLEND UNIQUE • STYLE MEETING RIGHT AWAY
              </textPath>
            </text>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-brass text-lg">✦</span>
          </div>
        </div>
      </div>
    </section>
  );
}
