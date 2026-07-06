"use client";

import Link from "next/link";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";
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

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function CatalogGrid({ products, currency }: { products: ProductRow[]; currency: Currency }) {
  const ref = useScrollReveal<HTMLDivElement>(60);

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-3 md:gap-x-5 gap-y-6 md:gap-y-10">
      {products.map((p) => {
        const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
        const displayPrice = resolvePrice(p, currency);
        return (
          <Link key={p.id} href={`/product/${p.slug}`} className="group block" data-reveal="card">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl md:rounded-lg bg-paper-raised mb-2">
              {image ? (
                <Image
                  src={image.url}
                  alt={p.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}
              <div className="absolute top-2 right-2">
                <SaveButton
                  item={{
                    productId: p.id,
                    name: p.name,
                    price: displayPrice.amount,
                    currency: displayPrice.currency,
                    image: image?.url ?? "",
                    href: `/product/${p.slug}`,
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-ink truncate">{p.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted">{formatPrice(displayPrice.amount, displayPrice.currency)}</p>
              <AddToCartButton
                productId={p.id}
                name={p.name}
                price={displayPrice.amount}
                currency={displayPrice.currency}
                image={image?.url ?? ""}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ink text-paper"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
