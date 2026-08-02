"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const TESTIMONIALS = [
  {
    name: "Amara Chukwu",
    quote: "The tailoring is impeccable — every piece fits like it was made just for me.",
    blob: "62% 38% 55% 45% / 45% 55% 45% 55%",
  },
  {
    name: "Tunde Bakare",
    quote: "Fast delivery, gorgeous fabric, and the fit was spot on straight out of the box.",
    blob: "45% 55% 62% 38% / 55% 45% 55% 45%",
  },
  {
    name: "Ifeoma Okoye",
    quote: "My go-to for events now — always compliments, always comfortable.",
    blob: "55% 45% 45% 55% / 38% 62% 38% 62%",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5 text-brass" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>★</span>
      ))}
    </div>
  );
}

export default function TestimonialsSection() {
  const ref = useScrollReveal<HTMLElement>(120);
  return (
    <section ref={ref} className="bg-paper py-16 md:py-24 px-6 md:px-10">
      <div className="max-w-6xl mx-auto">
        <h2
          className="uppercase leading-none mb-12 md:mb-16 text-center md:text-left"
          style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}
          data-reveal="heading"
        >
          Testimonials
        </h2>

        <div className="grid md:grid-cols-3 gap-10 md:gap-6">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              data-reveal="card"
              className={`bg-paper-raised shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-7 md:p-8 text-center flex flex-col items-center ${
                i === 1 ? "md:mt-10" : ""
              }`}
              style={{ borderRadius: t.blob }}
            >
              <Stars />
              <p className="text-sm text-muted mt-4 mb-5 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="w-11 h-11 rounded-full bg-brass/30 flex items-center justify-center font-display text-sm">
                {t.name.split(" ").map((w) => w[0]).join("")}
              </div>
              <p className="text-xs mt-2 tracking-wide uppercase">{t.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
