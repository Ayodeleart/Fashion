import LandingView from "@/components/LandingView";
import type { HeroBanner } from "@/components/Hero";
import type { LookbookPanel } from "@/components/Lookbook";
import type { Product } from "@/components/ProductGrid";
import { getSupabase } from "@/lib/supabase";
import { resolveCurrency, resolvePrice } from "@/lib/currency";

// This route always shows the marketing landing page, regardless of
// install status — a direct link for anyone who wants it specifically.
// The root route ("/") shows the same content to a plain browser tab too;
// see app/page.tsx + HomeOrLandingGate.
export const dynamic = "force-dynamic";

const fallbackDesktopBanners: HeroBanner[] = [{ id: "fallback-desktop", imageUrl: "/images/hero-desktop.jpg" }];
const fallbackMobileBanners: HeroBanner[] = [{ id: "fallback-mobile", imageUrl: "/images/hero-mobile.jpg" }];

async function getHeroBanners(device: "desktop" | "mobile"): Promise<HeroBanner[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_hero_banners")
    .select("id, image_url, href, subtitle, cta_text, cta_href")
    .eq("status", "published")
    .eq("device", device)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error || !data || data.length === 0) {
    return device === "desktop" ? fallbackDesktopBanners : fallbackMobileBanners;
  }

  return data.map((row) => ({
    id: row.id,
    imageUrl: row.image_url,
    href: row.href,
    subtitle: row.subtitle,
    ctaText: row.cta_text,
    ctaHref: row.cta_href,
  }));
}

// Fetched from its own table — completely separate from Home's
// ariana_lookbook_panels, managed at /admin/landing-lookbook. Empty
// array (not broken image paths) if nothing's been uploaded yet.
async function getLandingLookbookPanels(): Promise<LookbookPanel[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_landing_lookbook_panels")
    .select("id, label, image_url, href")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

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
  const [{ data, error }, currency] = await Promise.all([
    supabase
      .from("ariana_products")
      .select("id, name, price, currency, price_ngn, slug, ariana_product_images(url, position)")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .limit(8),
    resolveCurrency(),
  ]);

  if (error || !data || data.length === 0) return fallbackProducts;

  return data.map((row) => {
    const images = (row.ariana_product_images as { url: string; position: number }[]) ?? [];
    const firstImage = [...images].sort((a, b) => a.position - b.position)[0];
    const displayPrice = resolvePrice(row, currency);
    return {
      id: row.id,
      name: row.name,
      price: displayPrice.amount,
      currency: displayPrice.currency,
      image: firstImage?.url ?? "/images/product-placeholder.jpg",
      href: `/product/${row.slug}`,
    };
  });
}

export default async function LandingPage() {
  const [desktopBanners, mobileBanners, newArrivals, lookbookPanels] = await Promise.all([
    getHeroBanners("desktop"),
    getHeroBanners("mobile"),
    getNewArrivals(),
    getLandingLookbookPanels(),
  ]);

  return (
    <LandingView
      desktopBanners={desktopBanners}
      mobileBanners={mobileBanners}
      lookbookPanels={lookbookPanels}
      newArrivals={newArrivals}
    />
  );
}
