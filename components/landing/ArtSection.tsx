"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

type ArtSection = { image_url: string | null; quote_top: string; quote_bottom: string } | null;

export default function ArtSection({ section }: { section: ArtSection }) {
  const ref = useScrollReveal<HTMLElement>(100);
  const quoteTop = section?.quote_top || "WHERE ELEGANCE AND FASHION BECOMES ART";
  const quoteBottom = section?.quote_bottom || "MEETS ELEGANCE AND FASHION BECOMES ART";
  const imageUrl = section?.image_url;

  return (
    <section ref={ref} className="bg-ink py-16 md:py-24 px-6 flex justify-center" data-reveal="image">
      <div className="relative w-full max-w-md aspect-square">
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]">
          <defs>
            <path id="art-circle-top" d="M200,200 m-160,0 a160,160 0 1,1 320,0" />
            <path id="art-circle-bottom" d="M40,200 a160,160 0 1,1 320,0" />
          </defs>
          <text fontSize="15" fill="#f3f1ec" letterSpacing="2" style={{ fontFamily: "var(--font-landing-display)" }}>
            <textPath href="#art-circle-top" startOffset="2%">
              {quoteTop}
            </textPath>
          </text>
          <text fontSize="15" fill="#f3f1ec" letterSpacing="2" style={{ fontFamily: "var(--font-landing-display)" }}>
            <textPath href="#art-circle-bottom" startOffset="52%">
              {quoteBottom}
            </textPath>
          </text>
        </svg>

        <div className="absolute inset-[22%] rounded-full overflow-hidden bg-paper/10 border border-paper/20">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-full h-full object-cover grayscale" />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-paper/50 text-xs text-center px-6">
              <span className="text-xl">＋</span>
              <span>Upload a portrait photo in admin<br />(Landing: Fashion Becomes Art)</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
