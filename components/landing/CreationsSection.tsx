"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/components/ProductGrid";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

function ProductCard({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <a href={product.href} className={`shrink-0 rounded-2xl overflow-hidden bg-paper-raised block ${className}`}>
      <div className="relative aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </div>
      <div className="p-3">
        <p className="text-sm truncate">{product.name}</p>
        <p className="text-sm text-muted">{formatPrice(product.price, product.currency)}</p>
      </div>
    </a>
  );
}

function SeeAllCard({ className = "" }: { className?: string }) {
  return (
    <a
      href="/catalog"
      className={`shrink-0 rounded-2xl liquid-glass-button flex flex-col items-center justify-center text-center p-6 ${className}`}
    >
      <span className="font-display text-xl mb-2">See all our collection</span>
      <span className="text-xs opacity-80">Browse the full shop →</span>
    </a>
  );
}

const CARD_VH = 85;

export default function CreationsSection({ products }: { products: Product[] }) {
  const items = products.slice(0, 8);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const [translate, setTranslate] = useState(0);

  // Mobile scroll-jack: vertical scroll within the tall wrapper drives
  // horizontal translateX on the card track, pinned via position:sticky.
  // Once the track is fully scrolled (including the trailing "See all"
  // card), the wrapper ends and normal vertical scroll continues.
  useEffect(() => {
    function isMobile() {
      return window.innerWidth < 768;
    }

    let raf = 0;
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        if (!isMobile() || !wrapperRef.current || !trackRef.current) return;
        const wrapper = wrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        const scrollableDistance = wrapper.offsetHeight - window.innerHeight;
        if (scrollableDistance <= 0) return;
        const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
        const maxTranslate = Math.max(0, trackRef.current.scrollWidth - window.innerWidth);
        setTranslate(-progress * maxTranslate);
      });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  function scrollDesktop(dir: 1 | -1) {
    desktopScrollerRef.current?.scrollBy({ left: dir * 420, behavior: "smooth" });
  }

  if (items.length === 0) return null;

  return (
    <section id="creations" className="bg-paper">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-8 md:pb-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <p className="eyebrow mb-2">View Our Latest Creations</p>
            <h2
              className="uppercase leading-none"
              style={{ fontFamily: "var(--font-landing-display)", fontSize: "clamp(2rem, 5vw, 3.2rem)" }}
            >
              Our Creations
            </h2>
          </div>
          <p className="text-sm text-muted max-w-xs">
            A selection of recent work showcasing my approach to solving complex design and development
            challenges.
          </p>
        </div>
      </div>

      {/* Desktop: plain horizontal scroller + nav arrows */}
      <div className="hidden md:block">
        <div ref={desktopScrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar px-10 max-w-6xl mx-auto scroll-smooth">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} className="w-72" />
          ))}
          <SeeAllCard className="w-72 aspect-[3/4]" />
        </div>
        <div className="max-w-6xl mx-auto px-10 flex items-center gap-3 mt-8 mb-16">
          <button
            onClick={() => scrollDesktop(-1)}
            aria-label="Scroll left"
            className="w-11 h-11 rounded-full liquid-glass-light flex items-center justify-center"
          >
            ←
          </button>
          <a
            href="/catalog"
            aria-label="See full shop"
            className="w-11 h-11 rounded-full bg-brass text-ink flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            →
          </a>
        </div>
      </div>

      {/* Mobile: scroll-jack — vertical scroll drives horizontal movement */}
      <div ref={wrapperRef} className="md:hidden relative" style={{ height: `${(items.length + 1) * CARD_VH}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
          <div
            ref={trackRef}
            className="flex gap-4 px-6 will-change-transform"
            style={{ transform: `translateX(${translate}px)` }}
          >
            {items.map((p) => (
              <ProductCard key={p.id} product={p} className="w-[72vw]" />
            ))}
            <SeeAllCard className="w-[72vw] aspect-[3/4]" />
          </div>
        </div>
      </div>
    </section>
  );
}
