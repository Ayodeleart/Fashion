import Link from "next/link";
import Image from "next/image";
import { getSupabase } from "@/lib/supabase";
import { getCategories } from "@/lib/categories";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";
import TopBar from "@/components/TopBar";
import SearchBar from "@/components/SearchBar";
import CategoryRow from "@/components/CategoryRow";
import HeroCard from "@/components/HeroCard";
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
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

async function getProducts(category?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, category, ariana_product_images(url, position)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data as unknown as ProductRow[]) ?? [];
}

const fallbackHeroBanner: HeroBanner = { id: "fallback", imageUrl: "/images/hero-mobile.jpg", href: "/catalog" };

async function getShopHeroBanner(): Promise<HeroBanner> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_shop_hero")
    .select("id, label, image_url, href")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return fallbackHeroBanner;
  const row = data[0];
  return { id: row.id, label: row.label, imageUrl: row.image_url, href: row.href };
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories, heroBanner] = await Promise.all([
    getProducts(category),
    getCategories(),
    getShopHeroBanner(),
  ]);

  return (
    <main>
      <TopBar />
      <SearchBar />
      <CategoryRow categories={categories} />
      {!category && <HeroCard banner={heroBanner} />}

      <section className="px-5 pb-8">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-base font-semibold text-ink">
            {category ? category : "latest arrivals"}
          </h2>
          {category && (
            <Link href="/catalog" className="text-xs text-muted hover:text-brass transition-colors">
              Clear filter
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-muted">No products {category ? `in ${category} ` : ""}yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6">
            {products.map((p) => {
              const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
              return (
                <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-paper-raised mb-2">
                    {image ? (
                      <Image
                        src={image.url}
                        alt={p.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                        sizes="50vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                        No image
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <SaveButton
                        item={{
                          productId: p.id,
                          name: p.name,
                          price: p.price,
                          currency: p.currency,
                          image: image?.url ?? "",
                          href: `/product/${p.slug}`,
                        }}
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
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
