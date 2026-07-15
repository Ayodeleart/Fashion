"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { getCategories, type Category } from "@/lib/categories";
import AddToCartButton from "@/components/AddToCartButton";
import SmartBackButton from "@/components/SmartBackButton";

type Row = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  ariana_product_images: { url: string; position: number }[];
};

// No search-analytics table exists yet, so these are edited by hand —
// same pattern as the Home announcement bar. Swap these for whatever
// terms are actually popular for the brand.
const HOT_SEARCHES = ["Aso Oke", "Agbada", "Wedding Guest", "Senator Wear", "Ankara", "Corporate", "Native Wear"];

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

function CategoryDiscoveryList({ title, categories }: { title: string; categories: Category[] }) {
  if (categories.length === 0) return null;
  return (
    <div>
      <p className="text-sm font-semibold mb-3">{title}</p>
      <div className="flex flex-col gap-3">
        {categories.map((cat, i) => (
          <a key={cat.id} href={`/catalog?category=${encodeURIComponent(cat.name)}`} className="flex items-center gap-3">
            <span className="text-sm text-muted w-4 shrink-0">{i + 1}</span>
            <div className="w-11 h-11 rounded-lg overflow-hidden bg-paper-raised shrink-0">
              {cat.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.thumbnailUrl} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <span className="text-sm text-ink truncate">{cat.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}

function SearchInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const hasQuery = query.trim().length > 0;

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (!hasQuery) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    let active = true;
    setLoading(true);
    const supabase = getSupabase();
    supabase
      .from("ariana_products")
      .select("id, name, slug, price, currency, ariana_product_images(url, position)")
      .eq("is_published", true)
      .ilike("name", `%${query.trim()}%`)
      .limit(24)
      .then(({ data }) => {
        if (!active) return;
        setResults((data as unknown as Row[]) ?? []);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [query, hasQuery]);

  // Split the same category list into two discovery columns so it reads
  // like "Top Searches" / "Trending" without needing separate data.
  const half = Math.ceil(categories.length / 2);
  const topSearches = categories.slice(0, half);
  const trending = categories.slice(half);

  return (
    <main className="px-5 py-4">
      <div className="flex items-center gap-3 mb-6">
        <SmartBackButton
          fallbackHref="/"
          className="w-9 h-9 rounded-full bg-paper-raised flex items-center justify-center shrink-0"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </SmartBackButton>
        <div className="flex-1 flex items-center gap-3 bg-paper-raised rounded-full px-4 py-3">
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
      </div>

      {!hasQuery ? (
        <div className="space-y-8">
          <div>
            <p className="text-sm font-semibold mb-3">Hot Searches</p>
            <div className="flex flex-wrap gap-2">
              {HOT_SEARCHES.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-4 py-2 rounded-full bg-paper-raised text-sm text-ink"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-6">
            <CategoryDiscoveryList title="Top Searches" categories={topSearches} />
            <CategoryDiscoveryList title="Trending" categories={trending} />
          </div>
        </div>
      ) : loading ? (
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
