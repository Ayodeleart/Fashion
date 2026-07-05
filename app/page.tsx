import Lookbook, { LookbookPanel } from "@/components/Lookbook";
import ProductGrid, { Product } from "@/components/ProductGrid";
import Footer from "@/components/Footer";
import TopBar from "@/components/TopBar";
import SearchBar from "@/components/SearchBar";
import CategoryRow from "@/components/CategoryRow";
import HeroCard from "@/components/HeroCard";
import { getSupabase } from "@/lib/supabase";
import { getCategories } from "@/lib/categories";
import type { HeroBanner } from "@/components/Hero";

// Forced dynamic: without this, Next.js can prerender this page as static
// HTML at build time and cache it — meaning new hero banners, lookbook
// panels, or products published afterward via /admin wouldn't show up
// until the next deployment, regardless of revalidatePath calls. Always
// fetch live on every request instead.
export const dynamic = "force-dynamic";

const fallbackHeroBanner: HeroBanner = { id: "fallback", imageUrl: "/images/hero-mobile.jpg", href: "/catalog" };

async function getHomeHeroBanner(): Promise<HeroBanner> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_hero_banners")
    .select("id, label, image_url, href")
    .eq("status", "published")
    .eq("device", "mobile")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return fallbackHeroBanner;
  const row = data[0];
  return { id: row.id, label: row.label, imageUrl: row.image_url, href: row.href };
}

const fallbackLookbookPanels: LookbookPanel[] = [
  { id: "look-1", label: "The Tailored Line", image: "/images/look-1.jpg", href: "/catalog?look=tailored" },
  { id: "look-2", label: "Evening", image: "/images/look-2.jpg", href: "/catalog?look=evening" },
  { id: "look-3", label: "Off-Duty", image: "/images/look-3.jpg", href: "/catalog?look=off-duty" },
];

async function getLookbookPanels(): Promise<LookbookPanel[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, href")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data || data.length === 0) return fallbackLookbookPanels;

  return data.map((row) => ({
    id: row.id,
    label: row.label,
    image: row.image_url,
    href: row.href,
  }));
}

const fallbackProducts: Product[] = [
  { id: "p1", name: "Structured Wool Blazer", price: 890, currency: "USD", image: "/images/product-1.jpg", href: "/product/structured-wool-blazer" },
  { id: "p2", name: "Silk Slip Dress", price: 620, currency: "USD", image: "/images/product-2.jpg", href: "/product/silk-slip-dress" },
  { id: "p3", name: "Tailored Wide-Leg Trouser", price: 410, currency: "USD", image: "/images/product-3.jpg", href: "/product/tailored-wide-leg-trouser" },
  { id: "p4", name: "Cashmere Knit Top", price: 340, currency: "USD", image: "/images/product-4.jpg", href: "/product/cashmere-knit-top" },
];

async function getNewArrivals(): Promise<Product[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_products")
    .select("id, name, price, currency, slug, ariana_product_images(url, position)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(8);

  if (error || !data || data.length === 0) return fallbackProducts;

  return data.map((row) => {
    const images = (row.ariana_product_images as { url: string; position: number }[]) ?? [];
    const firstImage = [...images].sort((a, b) => a.position - b.position)[0];
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      currency: row.currency,
      image: firstImage?.url ?? "/images/product-placeholder.jpg",
      href: `/product/${row.slug}`,
    };
  });
}

export default async function Home() {
  const [categories, heroBanner, lookbookPanels, newArrivals] = await Promise.all([
    getCategories(),
    getHomeHeroBanner(),
    getLookbookPanels(),
    getNewArrivals(),
  ]);

  return (
    <main>
      <TopBar />
      <SearchBar />
      <CategoryRow categories={categories} />
      <HeroCard banner={heroBanner} />

      <ProductGrid title="latest arrivals" products={newArrivals} />

      <Lookbook panels={lookbookPanels} />

      <Footer brandName="AyodeleGold" />
    </main>
  );
}
