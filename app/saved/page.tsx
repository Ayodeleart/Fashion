"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSaved } from "@/components/SavedProvider";
import { getSupabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

type RecRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  ariana_product_images: { url: string; position: number }[];
};

function useRecommendations() {
  const [recs, setRecs] = useState<RecRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSupabase()
      .from("ariana_products")
      .select("id, name, slug, price, currency, ariana_product_images(url, position)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setRecs((data as unknown as RecRow[]) ?? []);
        setLoading(false);
      });
  }, []);

  return { recs, loading };
}

function RecommendationsGrid({ title }: { title: string }) {
  const { recs, loading } = useRecommendations();

  if (loading) return <p className="text-sm text-muted">Loading recommendations…</p>;
  if (recs.length === 0) return null;

  return (
    <section>
      <h2 className="text-base font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-2 gap-x-3 gap-y-6">
        {recs.map((p) => {
          const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
          return (
            <a key={p.id} href={`/product/${p.slug}`} className="group block">
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-paper-raised mb-2">
                {image && <Image src={image.url} alt={p.name} fill className="object-cover" sizes="50vw" />}
                <div className="absolute top-2 right-2">
                  <SaveButton
                    item={{ productId: p.id, name: p.name, price: p.price, currency: p.currency, image: image?.url ?? "", href: `/product/${p.slug}` }}
                  />
                </div>
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
    </section>
  );
}

export default function SavedPage() {
  const { items, loading, signedIn, toggle } = useSaved();

  if (loading) {
    return (
      <main className="px-5 py-16 text-center">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  if (!signedIn) {
    return (
      <main className="px-5 py-8">
        <h1 className="font-display text-2xl mb-2">Saved</h1>
        <p className="text-sm text-muted mb-6">
          <a href={`/account/login?next=${encodeURIComponent("/saved")}`} className="text-ink underline">Sign in</a> to save items across your devices — here's what people are loving right now.
        </p>
        <RecommendationsGrid title="Recommended for you" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="px-5 py-8">
        <h1 className="font-display text-2xl mb-2">Saved</h1>
        <p className="text-sm text-muted mb-6">Nothing saved yet — tap the heart on anything you love.</p>
        <RecommendationsGrid title="Recommended for you" />
      </main>
    );
  }

  return (
    <main className="px-5 py-8 space-y-10">
      <section>
        <h1 className="font-display text-2xl mb-6">Saved</h1>
        <div className="grid grid-cols-2 gap-x-3 gap-y-6">
          {items.map((item) => (
            <div key={item.productId} className="group block">
              <a href={item.href} className="relative aspect-[3/4] block overflow-hidden rounded-2xl bg-paper-raised mb-2">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="50vw" />}
              </a>
              <p className="text-sm text-ink truncate">{item.name}</p>
              {item.kind === "look" ? (
                <a href={item.href} className="text-sm text-muted underline mt-1 inline-block">
                  Shop this look
                </a>
              ) : (
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
              )}
              <button onClick={() => toggle(item)} className="text-xs text-muted underline mt-1 block">
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <RecommendationsGrid title="You might also like" />
    </main>
  );
}
