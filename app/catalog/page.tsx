import Link from "next/link";
import { Suspense } from "react";
import { getSupabase } from "@/lib/supabase";
import { getCategories } from "@/lib/categories";
import { resolveCurrency } from "@/lib/currency";
import TopBar from "@/components/TopBar";
import CategoryRow from "@/components/CategoryRow";
import FilterSortRow from "@/components/FilterSortRow";
import CatalogGrid from "@/components/CatalogGrid";
import ShopHeroCard from "@/components/ShopHeroCard";

// This is the e-commerce shop home (the mobile app screen). "/" is the
// separate editorial Home feed (Pinterest-style lookbook) — this is
// deliberately its own surface, reached via the bottom nav's Shop button.
export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  price_ngn: number | null;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

async function getProducts(category?: string, sort?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, price_ngn, category, ariana_product_images(url, position)")
    .eq("is_published", true);

  if (category) query = query.eq("category", category);

  if (sort === "price-asc") query = query.order("price", { ascending: true });
  else if (sort === "price-desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data } = await query;
  return (data as unknown as ProductRow[]) ?? [];
}

async function getShopHero() {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_shop_hero")
    .select("id, label, image_url, href")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id as string,
    label: row.label as string | null,
    imageUrl: row.image_url as string,
    href: row.href as string | null,
  }));
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; sort?: string }>;
}) {
  const { category, sort } = await searchParams;
  const [products, categories, currency, shopHero] = await Promise.all([
    getProducts(category, sort),
    getCategories(),
    resolveCurrency(),
    getShopHero(),
  ]);

  return (
    <main>
      <TopBar />

      <ShopHeroCard banners={shopHero} />

      <div className="sticky top-0 z-20 bg-paper shadow-[0_1px_0_rgba(0,0,0,0.06)] md:hidden">
        <CategoryRow categories={categories} />
      </div>
      <Suspense fallback={null}>
        <FilterSortRow categories={categories} />
      </Suspense>

      <section className="px-5 md:px-10 lg:px-16 py-4 md:pt-8 max-w-[1400px] mx-auto">
        {/* Desktop category filter — the mobile CategoryRow above is
            hidden at md+, this is the desktop equivalent. */}
        <div className="hidden md:flex flex-wrap gap-2 mb-8">
          <Link
            href="/catalog"
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              !category ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink/40"
            }`}
          >
            All
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/catalog?category=${encodeURIComponent(c.name)}`}
              className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                category === c.name ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink/40"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted">No products {category ? `in ${category} ` : ""}yet.</p>
        ) : (
          <CatalogGrid products={products} currency={currency} />
        )}
      </section>
    </main>
  );
}
