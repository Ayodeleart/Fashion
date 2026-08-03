"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";
import SignatureCredit from "@/components/SignatureCredit";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Shop", href: "#creations" },
  { label: "Contact", href: "/contact" },
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

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-12 border-b border-paper/10" data-reveal="paragraph">
          <p className="text-sm text-paper/60 max-w-sm">
            Where fabric meets finesse and creativity meets couture.
          </p>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-paper/70">
            {NAV.map((item) => (
              <a key={item.label} href={item.href} className="hover:text-paper transition-colors">
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center justify-between py-6">
          <p className="text-xs text-paper/40">
            {new Date().getFullYear()} Copyright © AyodeleGold. All rights reserved.
          </p>
          <SignatureCredit className="text-xs text-paper/40" />
        </div>
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
          Fashionista
        </h2>
      </div>
    </footer>
  );
}
