"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";

type Row = {
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

function SearchInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const supabase = getSupabase();
    const request = query.trim()
      ? supabase
          .from("ariana_products")
          .select("id, name, slug, price, currency, ariana_product_images(url, position)")
          .eq("is_published", true)
          .ilike("name", `%${query.trim()}%`)
          .limit(24)
      : supabase
          .from("ariana_products")
          .select("id, name, slug, price, currency, ariana_product_images(url, position)")
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(24);

    request.then(({ data }) => {
      if (!active) return;
      setResults((data as unknown as Row[]) ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [query]);

  return (
    <main className="px-5 py-6">
      <div className="flex items-center gap-3 bg-paper-raised rounded-full px-4 py-3 mb-6">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.6} />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Searching…</p>
      ) : results.length === 0 ? (
        <p className="text-sm text-muted">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {results.map((p) => {
            const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
            return (
              <a key={p.id} href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-paper-raised mb-2">
                  {image && <Image src={image.url} alt={p.name} fill className="object-cover" sizes="50vw" />}
                </div>
                <p className="text-sm text-ink truncate">{p.name}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm text-muted">{formatPrice(p.price, p.currency)}</p>
                  <AddToCartButton
                    productId={p.id}
                    name={p.name}
                    price={p.price}
                    currency={p.currency}
                    image={image?.url ?? ""}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-ink text-paper"
                  />
                </div>
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchInner />
    </Suspense>
  );
}
