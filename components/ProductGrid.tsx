"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";

export type Product = {
  id: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  href: string;
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductGrid({
  title,
  products,
}: {
  title: string;
  products: Product[];
}) {
  const ref = useScrollReveal<HTMLDivElement>(90);

  return (
    <section ref={ref} className="px-5 pb-8">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-base font-semibold text-ink" data-reveal="heading">
          {title}
        </h2>
        <a href="/catalog" className="text-xs text-muted hover:text-brass transition-colors">
          See all
        </a>
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {products.map((product) => (
          <a key={product.id} href={product.href} data-reveal="card" className="group block">
            <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-paper-raised mb-2">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                sizes="50vw"
              />
              <div className="absolute top-2 right-2">
                <SaveButton
                  item={{
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    currency: product.currency,
                    image: product.image,
                    href: product.href,
                  }}
                />
              </div>
            </div>
            <p className="text-sm text-ink truncate">{product.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted">{formatPrice(product.price, product.currency)}</p>
              <AddToCartButton
                productId={product.id}
                name={product.name}
                price={product.price}
                currency={product.currency}
                image={product.image}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ink text-paper"
              />
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
