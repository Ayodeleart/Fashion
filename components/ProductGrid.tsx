"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

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
    <section ref={ref} className="bg-paper px-6 md:px-10 py-20 md:py-28">
      <div className="flex items-baseline justify-between mb-10 md:mb-14">
        <h2 className="font-display text-3xl md:text-5xl text-ink" data-reveal="heading">
          {title}
        </h2>
        <a href="/catalog" className="text-sm text-muted hover:text-brass transition-colors">
          View all
        </a>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-14">
        {products.map((product) => (
          <a key={product.id} href={product.href} data-reveal="card" className="group block">
            <div className="relative aspect-[3/4] overflow-hidden bg-paper-raised mb-3">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
            <p className="text-sm text-ink">{product.name}</p>
            <p className="text-sm text-muted">{formatPrice(product.price, product.currency)}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
