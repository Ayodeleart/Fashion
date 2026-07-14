"use client";

import { useMemo, useRef, useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";
import StickyAddBar from "@/components/StickyAddBar";

type Variant = { id: string; size: string; color: string | null; stock: number };

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

export default function ProductPurchasePanel({
  productId,
  name,
  price,
  currency,
  image,
  variants,
  slug,
}: {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  variants: Variant[];
  slug: string;
}) {
  const colors = useMemo(
    () => Array.from(new Set(variants.map((v) => v.color).filter((c): c is string => !!c))),
    [variants]
  );
  const hasColors = colors.length > 0;

  const [selectedColor, setSelectedColor] = useState<string | null>(hasColors ? colors[0] : null);
  const [selected, setSelected] = useState<Variant | null>(null);

  const sizesForColor = useMemo(
    () => (hasColors ? variants.filter((v) => v.color === selectedColor) : variants),
    [variants, hasColors, selectedColor]
  );

  const hasVariants = variants.length > 0;
  const needsSelection = hasVariants && !selected;
  const outOfStock = selected ? selected.stock <= 0 : false;
  const sentinelRef = useRef<HTMLDivElement>(null);

  function pickColor(color: string) {
    setSelectedColor(color);
    setSelected(null);
  }

  return (
    <div>
      <div ref={sentinelRef} />
      <StickyAddBar
        productId={productId}
        variantId={selected?.id ?? null}
        size={selected?.size ?? null}
        name={name}
        price={price}
        currency={currency}
        image={image}
        disabled={needsSelection || outOfStock}
        sentinelRef={sentinelRef}
      />
      {hasColors && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">
            Color{selectedColor ? <span className="text-muted font-normal"> — {selectedColor}</span> : null}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {colors.map((color) => {
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  type="button"
                  aria-label={color}
                  onClick={() => pickColor(color)}
                  className={`w-9 h-9 rounded-full border-2 transition-all ${
                    isSelected ? "border-ink scale-110" : "border-ink/15 hover:border-ink/40"
                  }`}
                  style={{ backgroundColor: color }}
                />
              );
            })}
          </div>
        </div>
      )}

      {hasVariants && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Size</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((v) => {
              const isSelected = selected?.id === v.id;
              const disabled = v.stock <= 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setSelected(v)}
                  className={`w-11 h-11 rounded-full border text-sm flex items-center justify-center transition-colors ${
                    isSelected
                      ? "bg-ink text-paper border-ink"
                      : disabled
                      ? "border-ink/10 text-muted/40 line-through"
                      : "border-ink/20 hover:border-ink/50"
                  }`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>
          {needsSelection && <p className="text-xs text-muted mt-2">Pick a size to add this to your cart.</p>}
          {outOfStock && <p className="text-xs text-red-600 mt-2">That size is out of stock.</p>}
        </div>
      )}

      {/* Floating bar — the product page hides the bottom nav (see
          StorefrontChrome) specifically so this can sit right above the
          safe area without competing with it. */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-paper border-t border-ink/10 px-5 py-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] md:static md:border-0 md:p-0">
        <div className="flex items-center gap-3">
          <SaveButton
            item={{
              productId,
              name,
              price,
              currency,
              image,
              href: `/product/${slug}`,
            }}
            className="w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center shrink-0"
          />
          <AddToCartButton
            productId={productId}
            variantId={selected?.id ?? null}
            size={selected?.size ?? null}
            name={name}
            price={price}
            currency={currency}
            image={image}
            disabled={needsSelection || outOfStock}
            className="flex-1 md:flex-none md:px-10 text-sm py-3.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
            icon={<BagIcon className="w-4 h-4" />}
            label="Add to Bag"
          />
        </div>
      </div>
      {/* Spacer so page content isn't hidden behind the fixed bar above (mobile only). */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
