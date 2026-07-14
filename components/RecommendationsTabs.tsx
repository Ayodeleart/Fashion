"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { getRecentlyViewed, type RecentlyViewedItem } from "@/lib/recently-viewed";

type ForYouProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  ariana_product_images: { url: string; position: number }[];
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function RecommendationsTabs() {
  const [tab, setTab] = useState<"forYou" | "recent">("forYou");
  const [forYou, setForYou] = useState<ForYouProduct[]>([]);
  const [recent, setRecent] = useState<RecentlyViewedItem[]>([]);

  useEffect(() => {
    queueMicrotask(() => setRecent(getRecentlyViewed()));
    fetch("/api/products/related")
      .then((res) => res.json())
      .then((data) => setForYou(data.products ?? []));
  }, []);

  const items =
    tab === "forYou"
      ? forYou.map((p) => {
          const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
          return { id: p.id, slug: p.slug, name: p.name, price: p.price, currency: p.currency, image: image?.url ?? "" };
        })
      : recent.map((r) => ({ id: r.id, slug: r.slug, name: r.name, price: r.price, currency: r.currency, image: r.image }));

  if (forYou.length === 0 && recent.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="flex gap-6 border-b border-ink/10 mb-4">
        <button
          type="button"
          onClick={() => setTab("forYou")}
          className={`text-sm pb-2 -mb-px border-b-2 transition-colors ${
            tab === "forYou" ? "border-ink font-medium" : "border-transparent text-muted"
          }`}
        >
          For You
        </button>
        <button
          type="button"
          onClick={() => setTab("recent")}
          className={`text-sm pb-2 -mb-px border-b-2 transition-colors ${
            tab === "recent" ? "border-ink font-medium" : "border-transparent text-muted"
          }`}
        >
          Recently Viewed
        </button>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-muted">Nothing here yet — browse the catalog to see picks.</p>
      ) : (
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {items.map((item) => (
            <Link key={item.id} href={`/product/${item.slug}`} className="w-28 shrink-0">
              <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-paper-raised mb-1.5">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />}
              </div>
              <p className="text-xs truncate">{item.name}</p>
              <p className="text-xs text-muted">{formatPrice(item.price, item.currency)}</p>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
