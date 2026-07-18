"use client";

import ProductCard from "@/components/ProductCard";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { resolvePrice, type Currency } from "@/lib/currency-shared";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  price_ngn: number | null;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

const MOBILE_COLS_CLASS: Record<"2" | "3" | "4", string> = {
  "2": "grid-cols-2",
  "3": "grid-cols-3",
  "4": "grid-cols-4",
};

export default function CatalogGrid({
  products,
  currency,
  cols = "2",
}: {
  products: ProductRow[];
  currency: Currency;
  cols?: "2" | "3" | "4";
}) {
  const ref = useScrollReveal<HTMLDivElement>(60);

  return (
    <div
      ref={ref}
      className={`grid ${MOBILE_COLS_CLASS[cols]} md:grid-cols-4 lg:grid-cols-5 gap-x-px gap-y-px bg-ink/10 md:gap-x-4 md:gap-y-8 md:bg-transparent`}
    >
      {products.map((p, index) => {
        const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
        const displayPrice = resolvePrice(p, currency);
        return (
          <ProductCard
            key={p.id}
            product={{
              id: p.id,
              name: p.name,
              slug: p.slug,
              price: displayPrice.amount,
              currency: displayPrice.currency,
              category: p.category,
              image: image?.url ?? "",
              priority: index < 4,
            }}
            compact={cols !== "2"}
          />
        );
      })}
    </div>
  );
}
