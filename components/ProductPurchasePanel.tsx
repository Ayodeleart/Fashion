"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";
import StickyAddBar from "@/components/StickyAddBar";
import { useQuickAdd } from "@/components/QuickAddProvider";
import { useProductColor } from "@/components/ProductColorContext";

type Variant = { id: string; size: string; color: string | null; stock: number };

export default function ProductPurchasePanel({
  productId,
  name,
  price,
  currency,
  image,
  variants,
  slug,
  category,
}: {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  variants: Variant[];
  slug: string;
  category: string | null;
}) {
  const { colors, selectedColor, pickColor: setSelectedColorShared } = useProductColor();
  const hasColors = colors.length > 0;

  const [selected, setSelected] = useState<Variant | null>(null);

  const sizesForColor = useMemo(
    () => (hasColors ? variants.filter((v) => v.color === selectedColor) : variants),
    [variants, hasColors, selectedColor]
  );

  const hasVariants = variants.length > 0;
  const needsSelection = hasVariants && !selected;
  const outOfStock = selected ? selected.stock <= 0 : false;
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { showAdded } = useQuickAdd();

  function pickColor(color: string) {
    setSelectedColorShared(color);
    setSelected(null);
  }

  // Color can also change from the swatch overlay on the image itself —
  // reset the chosen size either way so it never shows a stale variant.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelected(null);
  }, [selectedColor]);

  function handleAdded() {
    showAdded(
      { id: productId, name, price, currency, image, slug, category },
      selected ? { size: selected.size, color: selected.color } : null
    );
  }

  return (
    <div>
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
        onAdded={handleAdded}
      />
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

      {/* Normal in-flow row — NOT fixed/sticky. It scrolls away like any
          other content. The sentinel right after it is what the top
          StickyAddBar watches: once this row scrolls out of view, the
          sticky bar takes over up top. Two different bars never compete
          for the same space, and this one never floats over content. */}
      <div className="flex items-center gap-2.5">
        <AddToCartButton
          productId={productId}
          variantId={selected?.id ?? null}
          size={selected?.size ?? null}
          name={name}
          price={price}
          currency={currency}
          image={image}
          disabled={needsSelection || outOfStock}
          fullWidth
          onAdded={handleAdded}
          className="flex-1 md:flex-none md:px-12 h-14 text-base font-semibold rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-40 flex items-center justify-center"
          label="Add to Bag"
        />
        <SaveButton
          item={{
            productId,
            name,
            price,
            currency,
            image,
            href: `/product/${slug}`,
          }}
          className="w-14 h-14 rounded-full border border-ink/15 flex items-center justify-center shrink-0"
        />
      </div>

      <Link
        href={`/try-on?product=${encodeURIComponent(slug)}`}
        className="mt-2.5 w-full h-12 rounded-full border border-brass/40 text-sm font-medium text-ink hover:bg-brass/10 transition-colors flex items-center justify-center gap-1.5"
      >
        <span aria-hidden>✨</span> Try It On
      </Link>

      <div ref={sentinelRef} />
    </div>
  );
}
