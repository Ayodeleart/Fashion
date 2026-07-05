"use client";

import Image from "next/image";
import { useSaved } from "@/components/SavedProvider";
import AddToCartButton from "@/components/AddToCartButton";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function SavedPage() {
  const { items, toggle } = useSaved();

  if (items.length === 0) {
    return (
      <main className="px-5 py-16 text-center">
        <h1 className="font-display text-2xl mb-2">Nothing saved yet</h1>
        <p className="text-sm text-muted mb-6">Tap the heart on any item to save it for later.</p>
        <a href="/catalog" className="inline-block bg-ink text-paper text-sm rounded-full px-5 py-2.5">
          Browse catalog
        </a>
      </main>
    );
  }

  return (
    <main className="px-5 py-8">
      <h1 className="font-display text-2xl mb-6">Saved</h1>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {items.map((item) => (
          <div key={item.productId} className="group block">
            <a href={item.href} className="relative aspect-[3/4] block overflow-hidden rounded-2xl bg-paper-raised mb-2">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="50vw" />}
            </a>
            <p className="text-sm text-ink truncate">{item.name}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-muted">{formatPrice(item.price, item.currency)}</p>
              <AddToCartButton
                productId={item.productId}
                name={item.name}
                price={item.price}
                currency={item.currency}
                image={item.image}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ink text-paper"
              />
            </div>
            <button onClick={() => toggle(item)} className="text-xs text-muted underline mt-1">
              Remove
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
