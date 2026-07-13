"use client";

import Link from "next/link";
import Image from "next/image";
import SaveButton from "@/components/SaveButton";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import { useHasMeasurements } from "@/hooks/useHasMeasurements";
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
  const aiFitReady = useHasMeasurements();

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-px gap-y-px bg-ink/10 md:gap-x-4 md:gap-y-8 md:bg-transparent">
      {products.map((p, index) => {
        const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
        const displayPrice = resolvePrice(p, currency);
        return (
          <Link key={p.id} href={`/product/${p.slug}`} className="group block bg-paper" data-reveal="card">
            <div className="relative aspect-[3/4] overflow-hidden md:rounded-lg bg-paper-raised">
              {image ? (
                <Image
                  src={image.url}
                  alt={p.name}
                  fill
                  priority={index < 4}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 50vw, 20vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                  No image
                </div>
              )}

              {aiFitReady && (
                <span className="absolute top-2 left-2 text-[10px] tracking-wide bg-ink/85 text-paper px-2 py-1 rounded-full">
                  AI perfect fit
                </span>
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

            <div className="px-2 pt-2 pb-3">
              <p className="text-[10px] tracking-wide text-muted uppercase">AyodeleGold</p>
              <p className="text-sm text-ink truncate">{p.name}</p>
              <p className="text-sm text-ink font-medium mt-0.5">
                {formatPrice(displayPrice.amount, displayPrice.currency)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
