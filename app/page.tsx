import Hero, { HeroLook } from "@/components/Hero";
import Lookbook, { LookbookPanel } from "@/components/Lookbook";
import ProductGrid, { Product } from "@/components/ProductGrid";
import CraftSection from "@/components/CraftSection";
import Footer from "@/components/Footer";
import { getSupabase } from "@/lib/supabase";

// FALLBACK DATA — only used if no hero look has been published yet from
// /admin/hero (or if the Supabase fetch fails). Once looks exist in
// ariana_hero_looks, those take over automatically.
const fallbackHeroLooks: HeroLook[] = [
  {
    id: "look-1",
    imageLeft: "/images/hero-1-left.png",
    imageMiddle: "/images/hero-1-middle.png",
    imageRight: "/images/hero-1-right.png",
    bgColor: "22, 48, 42", // Emerald
  },
  {
    id: "look-2",
    imageLeft: "/images/hero-2-left.png",
    imageMiddle: "/images/hero-2-middle.png",
    imageRight: "/images/hero-2-right.png",
    bgColor: "74, 47, 31", // Coffee Brown
  },
];

async function getHeroLooks(): Promise<HeroLook[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_hero_looks")
    .select("id, image_left_url, image_middle_url, image_right_url, bg_color")
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) return fallbackHeroLooks;

  return data.map((row) => ({
    id: row.id,
    imageLeft: row.image_left_url,
    imageMiddle: row.image_middle_url,
    imageRight: row.image_right_url,
    bgColor: row.bg_color,
  }));
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

const newArrivals: Product[] = [
  { id: "p1", name: "Structured Wool Blazer", price: 890, currency: "USD", image: "/images/product-1.jpg", href: "/product/structured-wool-blazer" },
  { id: "p2", name: "Silk Slip Dress", price: 620, currency: "USD", image: "/images/product-2.jpg", href: "/product/silk-slip-dress" },
  { id: "p3", name: "Tailored Wide-Leg Trouser", price: 410, currency: "USD", image: "/images/product-3.jpg", href: "/product/tailored-wide-leg-trouser" },
  { id: "p4", name: "Cashmere Knit Top", price: 340, currency: "USD", image: "/images/product-4.jpg", href: "/product/cashmere-knit-top" },
];

export default async function Home() {
  const [heroLooks, lookbookPanels] = await Promise.all([getHeroLooks(), getLookbookPanels()]);

  return (
    <main>
      <Hero looks={heroLooks} brandPrefix="AYODELE" brandSuffix="GOLD" tagline="fashionista" />

      <Lookbook panels={lookbookPanels} />

      <ProductGrid title="New Arrivals" products={newArrivals} />

      <CraftSection
        image="/images/craft.jpg"
        eyebrow="Craft"
        heading="Every seam considered"
        body="Each piece moves through pattern, fit, and finish with the same
          attention — cut close enough to hold its shape, loose enough to
          move the way you do. Fabric first, decoration last."
      />

      <Footer brandName="AyodeleGold" />
    </main>
  );
}
