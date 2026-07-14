"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";

type RelatedProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

export default function RelatedProducts({
  title,
  category,
  excludeId,
  infinite = false,
}: {
  title: string;
  category: string | null;
  excludeId: string;
  infinite?: boolean;
}) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const params = new URLSearchParams({ exclude: excludeId, offset: String(offset) });
    if (category) params.set("category", category);
    const res = await fetch(`/api/products/related?${params.toString()}`);
    const data = await res.json();
    setProducts((prev) => [...prev, ...(data.products ?? [])]);
    setHasMore(Boolean(data.hasMore));
    setOffset((o) => o + (data.products?.length ?? 0));
    setLoading(false);
  }, [category, excludeId, offset, loading, hasMore]);

  // Initial load.
  useEffect(() => {
    queueMicrotask(() => loadMore());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!infinite) return;
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [infinite, loadMore]);

  if (products.length === 0 && !loading) return null;

  return (
    <section className="mt-10 pt-8 border-t border-ink/10">
      <p className="text-xs tracking-[0.15em] font-medium text-ink/60 mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {products.map((p) => {
          const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
          return (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                slug: p.slug,
                price: p.price,
                currency: p.currency,
                category: p.category,
                image: image?.url ?? "",
              }}
            />
          );
        })}
      </div>

      {infinite && hasMore && (
        <div ref={sentinelRef} className="py-8 text-center text-xs text-muted">
          {loading ? "Loading more…" : ""}
        </div>
      )}
    </section>
  );
}
