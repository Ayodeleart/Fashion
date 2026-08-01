"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Who dis?", href: "#about" },
  { label: "My vibes", href: "#creations" },
  { label: "Hit me up", href: "/contact" },
];

export default function LandingFooter() {
  const ref = useScrollReveal<HTMLElement>(100);
  return (
    <footer ref={ref} className="bg-ink text-paper pt-16 md:pt-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2 mb-12 md:mb-16">
          <span className="font-display text-2xl md:text-3xl">Thank You</span>
          <span className="flex items-center gap-2 text-sm">
            <span className="text-brass">✦</span> AYODELEGOLD
          </span>
          <span className="font-display text-2xl md:text-3xl">For Viewing</span>
        </div>

        <div className="grid md:grid-cols-2 gap-10 pb-12 border-b border-paper/10" data-reveal="paragraph">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/hero-mobile.jpg"
              alt=""
              className="w-40 h-52 md:w-48 md:h-64 rounded-2xl object-cover grayscale-0"
            />
          </div>
          <div className="flex flex-col md:items-end justify-between">
            <nav className="flex flex-col gap-2 text-sm text-paper/70 md:items-end">
              {NAV.map((item) => (
                <a key={item.label} href={item.href} className="hover:text-paper transition-colors">
                  {item.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-4 mt-6 text-lg">
              <a href="#" aria-label="Facebook" className="hover:text-brass transition-colors">f</a>
              <a href="#" aria-label="WhatsApp" className="hover:text-brass transition-colors">w</a>
              <a href="#" aria-label="Pinterest" className="hover:text-brass transition-colors">p</a>
              <a href="#" aria-label="Instagram" className="hover:text-brass transition-colors">◎</a>
            </div>
          </div>
        </div>

        <p className="text-xs text-paper/40 py-6">
          {new Date().getFullYear()} Copyright © AyodeleGold. All rights reserved.
        </p>
      </div>

      <div className="relative select-none pointer-events-none -mb-4 md:-mb-8">
        <h2
          className="uppercase text-center leading-none whitespace-nowrap"
          style={{
            fontFamily: "var(--font-landing-display)",
            fontSize: "clamp(4.5rem, 22vw, 14rem)",
            WebkitTextStroke: "1px rgba(243,241,236,0.9)",
            color: "transparent",
          }}
          aria-hidden
        >
          Designer
        </h2>
      </div>
    </footer>
  );
}
