"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

const BagIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M5.57386 4.69147C4.74068 5.38295 4.52122 6.55339 4.08231 8.89427L3.33231 12.8943C2.71512 16.186 2.40652 17.8318 3.30624 18.9159C4.20595 20 5.88048 20 9.22954 20H14.7704C18.1195 20 19.794 20 20.6937 18.9159C21.5934 17.8318 21.2849 16.186 20.6677 12.8943L19.9177 8.89427C19.4787 6.55339 19.2593 5.38295 18.4261 4.69147C17.5929 4 16.4021 4 14.0204 4H9.97954C7.59787 4 6.40703 4 5.57386 4.69147ZM9.87822 7.75007C10.1875 8.62497 11.0219 9.25 12.0004 9.25C12.9789 9.25 13.8133 8.62497 14.1225 7.75007C14.2606 7.35953 14.6891 7.15483 15.0796 7.29287C15.4701 7.43091 15.6748 7.8594 15.5368 8.24993C15.0224 9.70541 13.6343 10.75 12.0004 10.75C10.3664 10.75 8.97839 9.70541 8.46396 8.24993C8.32592 7.8594 8.53061 7.43091 8.92115 7.29287C9.31169 7.15483 9.74018 7.35953 9.87822 7.75007Z"
      fill="currentColor"
    />
  </svg>
);

export default function StickyAddBar({
  productId,
  variantId,
  size,
  name,
  price,
  currency,
  image,
  disabled,
  sentinelRef,
}: {
  productId: string;
  variantId: string | null;
  size: string | null;
  name: string;
  price: number;
  currency: string;
  image: string;
  disabled: boolean;
  sentinelRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    // Deliberately not using IntersectionObserver + rootMargin here: on iOS
    // Safari/PWA standalone, the collapsing address bar resizes the visual
    // viewport mid-scroll, which causes the observer to recompute against a
    // stale viewport and briefly report isIntersecting=true again even though
    // we're well past the sentinel — the bar snaps hidden and doesn't get a
    // second trigger to come back. Checking getBoundingClientRect directly
    // in a rAF-throttled scroll/resize listener sidesteps that entirely.
    let ticking = false;
    const HEADER_OFFSET = 64;

    function update() {
      ticking = false;
      const rect = el.getBoundingClientRect();
      setVisible(rect.top < HEADER_OFFSET);
    }

    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [sentinelRef]);

  function formatPrice(p: number, c: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: c, maximumFractionDigits: 0 }).format(p);
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 bg-paper/95 backdrop-blur border-b border-ink/10 px-4 py-2.5 flex items-center gap-3 transition-transform duration-200 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
      style={{ paddingTop: "calc(env(safe-area-inset-top) + 0.625rem)" }}
    >
      <div className="relative w-11 h-14 rounded-lg overflow-hidden bg-paper-raised shrink-0">
        {image && <Image src={image} alt={name} fill className="object-cover" sizes="44px" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{name}</p>
        <p className="text-sm text-muted">{formatPrice(price, currency)}</p>
      </div>
      <AddToCartButton
        productId={productId}
        variantId={variantId}
        size={size}
        name={name}
        price={price}
        currency={currency}
        image={image}
        disabled={disabled}
        className="shrink-0 text-xs px-4 py-2.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
        icon={<BagIcon className="w-3.5 h-3.5" />}
        label="Add to Bag"
      />
    </div>
  );
}
