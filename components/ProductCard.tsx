"use client";

import Link from "next/link";
import Image from "next/image";
import SaveButton from "@/components/SaveButton";
import { useQuickAdd } from "@/components/QuickAddProvider";

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

export type CardProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string | null;
  image: string;
  brandLabel?: string;
  priority?: boolean;
};

export default function ProductCard({ product }: { product: CardProduct }) {
  const { openQuickAdd } = useQuickAdd();

  function formatPrice(price: number, currency: string) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
  }

  return (
    <Link href={`/product/${product.slug}`} className="group block bg-paper" data-reveal="card">
      <div className="relative aspect-[3/4] overflow-hidden md:rounded-lg bg-paper-raised">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            priority={product.priority}
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
        )}

        <div className="absolute top-2 right-2">
          <SaveButton
            item={{
              productId: product.id,
              name: product.name,
              price: product.price,
              currency: product.currency,
              image: product.image,
              href: `/product/${product.slug}`,
            }}
          />
        </div>

        <button
          type="button"
          aria-label="Quick add to bag"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickAdd({
              id: product.id,
              name: product.name,
              price: product.price,
              currency: product.currency,
              image: product.image,
              slug: product.slug,
              category: product.category,
            });
          }}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <BagIcon className="w-4 h-4" />
        </button>
      </div>

      <div className="px-2 pt-2 pb-3">
        {product.brandLabel && <p className="text-[10px] tracking-wide text-muted uppercase">{product.brandLabel}</p>}
        <p className="text-sm text-ink truncate">{product.name}</p>
        <p className="text-sm text-ink font-medium mt-0.5">{formatPrice(product.price, product.currency)}</p>
      </div>
    </Link>
  );
}
