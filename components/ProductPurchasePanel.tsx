"use client";

import { useState } from "react";
import AddToCartButton from "@/components/AddToCartButton";

type Variant = { id: string; size: string; color: string | null; stock: number };

export default function ProductPurchasePanel({
  productId,
  name,
  price,
  currency,
  image,
  variants,
}: {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  variants: Variant[];
}) {
  const [selected, setSelected] = useState<Variant | null>(null);
  const hasVariants = variants.length > 0;
  const needsSelection = hasVariants && !selected;
  const outOfStock = selected ? selected.stock <= 0 : false;

  return (
    <div>
      {hasVariants && (
        <div className="mb-6">
          <p className="text-sm font-medium mb-2">Choose size</p>
          <div className="flex flex-wrap gap-2">
            {variants.map((v) => {
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
        <AddToCartButton
          productId={productId}
          variantId={selected?.id ?? null}
          size={selected?.size ?? null}
          name={name}
          price={price}
          currency={currency}
          image={image}
          disabled={needsSelection || outOfStock}
          className="w-full md:w-auto md:px-10 text-sm py-3.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-40"
        />
      </div>
      {/* Spacer so page content isn't hidden behind the fixed bar above (mobile only). */}
      <div className="h-24 md:hidden" />
    </div>
  );
}
