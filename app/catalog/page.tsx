import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getCategories } from "@/lib/categories";
import { resolveCurrency } from "@/lib/currency";
import TopBar from "@/components/TopBar";
import SearchBar from "@/components/SearchBar";
import CategoryRow from "@/components/CategoryRow";
import HeroCard from "@/components/HeroCard";
import CatalogGrid from "@/components/CatalogGrid";
import type { HeroBanner } from "@/components/Hero";

// This is the e-commerce shop home (the mobile app screen). "/" stays the
// separate editorial landing page — this is deliberately its own surface.
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

async function getProducts(category?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, price_ngn, category, ariana_product_images(url, position)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data as unknown as ProductRow[]) ?? [];
}

const fallbackHeroBanner: HeroBanner = { id: "fallback", imageUrl: "/images/hero-mobile.jpg", href: "/catalog" };

async function getShopHeroBanners(): Promise<HeroBanner[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_shop_hero")
    .select("id, label, image_url, href")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return [fallbackHeroBanner];
  return data.map((row) => ({ id: row.id, label: row.label, imageUrl: row.image_url, href: row.href }));
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories, heroBanners, currency] = await Promise.all([
    getProducts(category),
    getCategories(),
    getShopHeroBanners(),
    resolveCurrency(),
  ]);

  return (
    <main>
      {heroBanners[0] && (
        <link rel="preload" as="image" href={heroBanners[0].imageUrl} fetchPriority="high" />
      )}
      <TopBar />
      <div className="md:hidden">
        <SearchBar />
        <CategoryRow categories={categories} />
        {!category && <HeroCard banners={heroBanners} />}
      </div>

      <section className="px-5 md:px-10 lg:px-16 pb-8 md:pt-8 max-w-[1400px] mx-auto">
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

        <div className="flex items-baseline justify-between mb-4 md:mb-6">
          <h2 className="text-base md:text-2xl font-semibold text-ink capitalize">
            {category ? category : "latest arrivals"}
          </h2>
          {category && (
            <Link href="/catalog" className="text-xs md:text-sm text-muted hover:text-brass transition-colors">
              Clear filter
            </Link>
          )}
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
