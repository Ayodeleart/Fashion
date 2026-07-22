"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type PickerTarget = { name: string; image: string; href: string };

type Tab = "products" | "looks";

type ProductRow = {
  name: string;
  slug: string;
  ariana_product_images: { url: string; position: number }[];
};

type LookRow = { id: string; label: string; image_url: string | null };

export default function TryOnPicker({ onPick }: { onPick: (target: PickerTarget) => void }) {
  const [tab, setTab] = useState<Tab>("products");
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [looks, setLooks] = useState<LookRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);
    const supabase = getSupabase();

    const request =
      tab === "products"
        ? supabase
            .from("ariana_products")
            .select("name, slug, ariana_product_images(url, position)")
            .eq("is_published", true)
            .ilike("name", query.trim() ? `%${query.trim()}%` : "%%")
            .limit(24)
        : supabase
            .from("ariana_lookbook_panels")
            .select("id, label, image_url")
            .ilike("label", query.trim() ? `%${query.trim()}%` : "%%")
            .limit(24);

    request.then(({ data, error: dbError }) => {
      if (!active) return;
      if (dbError) {
        setError("Couldn't load those right now.");
        setLoading(false);
        return;
      }
      if (tab === "products") setProducts((data as unknown as ProductRow[]) ?? []);
      else setLooks((data as unknown as LookRow[]) ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [tab, query]);

  return (
    <div className="rounded-2xl border border-ink/10 p-4">
      <p className="text-sm font-medium mb-3">Pick something to try on</p>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setTab("products")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            tab === "products" ? "bg-ink text-paper" : "bg-paper-raised text-ink"
          }`}
        >
          Products
        </button>
        <button
          type="button"
          onClick={() => setTab("looks")}
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            tab === "looks" ? "bg-ink text-paper" : "bg-paper-raised text-ink"
          }`}
        >
          Looks
        </button>
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={tab === "products" ? "Search products…" : "Search looks…"}
        className="w-full bg-paper-raised rounded-full px-4 py-2.5 text-sm outline-none mb-3"
      />

      {loading && <p className="text-xs text-muted py-6 text-center">Loading…</p>}
      {error && <p className="text-xs text-red-600 py-2">{error}</p>}

      {!loading && !error && tab === "products" && products.length === 0 && (
        <p className="text-xs text-muted py-6 text-center">No products found.</p>
      )}
      {!loading && !error && tab === "looks" && looks.length === 0 && (
        <p className="text-xs text-muted py-6 text-center">No looks found.</p>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
          {tab === "products"
            ? products.map((p) => {
                const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url;
                if (!image) return null;
                return (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => onPick({ name: p.name, image, href: `/product/${p.slug}` })}
                    className="text-left"
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-paper-raised mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image} alt={p.name} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] text-ink truncate">{p.name}</p>
                  </button>
                );
              })
            : looks.map((l) => {
                if (!l.image_url) return null;
                return (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onPick({ name: l.label, image: l.image_url as string, href: `/look/${l.id}` })}
                    className="text-left"
                  >
                    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-paper-raised mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.image_url} alt={l.label} className="w-full h-full object-cover" />
                    </div>
                    <p className="text-[11px] text-ink truncate">{l.label}</p>
                  </button>
                );
              })}
        </div>
      )}
    </div>
  );
}
