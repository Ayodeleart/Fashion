"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";

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
  onAdded,
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
  onAdded?: () => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const sentinel: HTMLDivElement = el;

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
      const rect = sentinel.getBoundingClientRect();
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
        onAdded={onAdded}
        className="shrink-0 text-xs px-4 py-2.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-40"
        label="Add to Bag"
      />
    </div>
  );
}
