"use client";

import { useEffect, useRef, useState } from "react";
import type { Product } from "@/components/ProductGrid";
import AddToCartButton from "@/components/AddToCartButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

function ProductCard({
  product,
  className = "",
  reveal = false,
}: {
  product: Product;
  className?: string;
  reveal?: boolean;
}) {
  return (
    <div
      data-reveal={reveal ? "card" : undefined}
      className={`shrink-0 rounded-2xl overflow-hidden bg-paper-raised shadow-[0_12px_30px_rgba(0,0,0,0.12)] ${className}`}
    >
      <a href={product.href} className="block relative aspect-[3/4]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
      </a>
      <div className="p-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm truncate">{product.name}</p>
          <p className="text-sm text-muted">{formatPrice(product.price, product.currency)}</p>
        </div>
        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          currency={product.currency}
          image={product.image}
          label="Bag"
          className="text-xs px-3 py-1.5 rounded-full liquid-glass-button shrink-0"
        />
      </div>
    </div>
  );
}

function SeeAllCard({ className = "", reveal = false }: { className?: string; reveal?: boolean }) {
  return (
    <a
      href="/catalog"
      data-reveal={reveal ? "card" : undefined}
      className={`shrink-0 rounded-2xl liquid-glass-button flex flex-col items-center justify-center text-center p-6 ${className}`}
    >
      <span className="font-display text-xl mb-2">See all our collection</span>
      <span className="text-xs opacity-80">Browse the full shop →</span>
    </a>
  );
}

// Alternating vertical offset + slight rotation per card, matching the
// fanned/staggered card layout in the reference (not a flat uniform row).
const STAGGER = [
  "md:mt-0 md:-rotate-1",
  "md:mt-10 md:rotate-1",
  "md:mt-2 md:-rotate-1",
  "md:mt-12 md:rotate-2",
  "md:mt-4 md:-rotate-2",
  "md:mt-14 md:rotate-1",
  "md:mt-2 md:-rotate-1",
  "md:mt-10 md:rotate-2",
];

const CARD_VH = 85;

export default function CreationsSection({ products }: { products: Product[] }) {
  const items = products.slice(0, 8);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopScrollerRef = useRef<HTMLDivElement>(null);
  const revealRef = useScrollReveal<HTMLElement>(90);
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
    <section id="creations" ref={revealRef} className="bg-paper">
      <div className="max-w-6xl mx-auto px-6 md:px-10 pt-16 md:pt-24 pb-8 md:pb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-14" data-reveal="heading">
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

        {/* Desktop: staggered/fanned horizontal scroller + nav arrows */}
        <div className="hidden md:block">
          <div ref={desktopScrollerRef} className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth py-4">
            {items.map((p, i) => (
              <ProductCard key={p.id} product={p} className={`w-72 ${STAGGER[i % STAGGER.length]}`} reveal />
            ))}
            <SeeAllCard className={`w-72 aspect-[3/4] ${STAGGER[items.length % STAGGER.length]}`} reveal />
          </div>
          <div className="flex items-center gap-3 mt-10">
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
