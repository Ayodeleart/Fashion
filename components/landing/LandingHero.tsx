"use client";

import type { HeroBanner } from "@/components/Hero";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function LandingHero({ banner }: { banner: HeroBanner | null }) {
  const ref = useScrollReveal<HTMLElement>(80);

  return (
    <section ref={ref} className="relative bg-ink text-paper overflow-hidden pt-6 pb-0">
      <div className="max-w-6xl mx-auto px-6 md:px-10 relative">
        <p className="eyebrow text-paper/60 mb-1" data-reveal="heading">
          AYODELE <span className="text-brass">GOLD</span>
        </p>

        <div className="relative" data-reveal="heading">
          <h1
            className="select-none leading-[0.82] uppercase break-words"
            style={{
              fontFamily: "var(--font-landing-display)",
              fontSize: "clamp(3.2rem, 13vw, 8.5rem)",
              WebkitTextStroke: "1px rgba(243,241,236,0.35)",
              color: "transparent",
            }}
            aria-hidden
          >
            Fashionista
          </h1>
          <h1
            className="select-none leading-[0.82] uppercase -mt-[0.78em] relative z-10"
            style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(3.2rem, 13vw, 8.5rem)" }}
          >
            Fashionista
          </h1>
        </div>

        <p className="max-w-xs text-sm text-paper/70 mt-4 pb-8 md:pb-10" data-reveal="paragraph">
          Where fabric meets finesse and creativity meets couture.
        </p>
      </div>

      {/* Full-bleed hero photo — edge to edge, no side padding/rounded
          container clipping it in. */}
      <div className="relative w-full aspect-[3/4] md:aspect-[21/9] bg-ink/40" data-reveal="image">
        {banner ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner.imageUrl} alt="" className="w-full h-full object-cover" fetchPriority="high" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-paper/30 text-sm">
            Upload a hero photo in admin
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />

        <svg
          className="absolute left-4 bottom-4 md:left-8 md:bottom-8 opacity-70"
          width="26"
          height="26"
          viewBox="0 0 26 26"
          fill="none"
        >
          <path d="M13 0v26M0 13h26" stroke="#f3f1ec" strokeWidth={1} />
        </svg>

        <div className="absolute right-4 top-4 md:right-8 md:top-8 w-16 h-16 md:w-20 md:h-20">
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

        <div className="absolute left-4 top-4 md:left-8 md:top-8 text-left text-white">
          <p className="font-display text-lg md:text-xl leading-tight">
            Styled
            <br />
            to perfection
          </p>
        </div>
      </div>
    </section>
  );
}
