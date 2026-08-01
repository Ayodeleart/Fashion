"use client";

import { useEffect, useState } from "react";

const NAV = [
  { label: "Home", href: "#top" },
  { label: "Who dis?", href: "#about" },
  { label: "My vibes", href: "#creations" },
  { label: "Hit me up", href: "/contact" },
];

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      id="top"
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled ? "liquid-glass-light" : "bg-transparent"
      }`}
      style={{ borderRadius: 0 }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-10 py-4">
        <a href="#top" className="flex items-center gap-2 font-display font-semibold tracking-wide text-sm md:text-base">
          <span aria-hidden className="text-brass">✦</span> AYODELEGOLD
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className="hover:text-brass transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <a
          href="/catalog"
          className="text-xs md:text-sm liquid-glass-button px-5 py-2.5 rounded-full"
        >
          Let&apos;s Link
        </a>
      </div>
    </header>
  );
}
