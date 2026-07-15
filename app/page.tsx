import { getSupabase } from "@/lib/supabase";
import { resolveCurrency, resolvePrice } from "@/lib/currency";
import HomeOrLandingGate from "@/components/HomeOrLandingGate";
import type { EditorialHeroLook } from "@/components/home/EditorialHero";
import type { FeedLook } from "@/components/home/HomeFeed";
import type { HeroBanner } from "@/components/Hero";
import type { LookbookPanel } from "@/components/Lookbook";
import type { Product } from "@/components/ProductGrid";

// Forced dynamic: without this, Next.js can prerender this page as static
// HTML at build time — meaning new looks, banners, or products published
// afterward via /admin wouldn't show up until the next deployment.
export const dynamic = "force-dynamic";

// ---------- Home (editorial Pinterest lookbook) ----------

const fallbackHero: EditorialHeroLook = {
  id: "fallback-hero",
  image: "/images/look-1.jpg",
  label: "The Season, Reimagined",
  mediaType: "image",
};

type PanelRow = {
  id: string;
  label: string;
  image_url: string;
  href: string | null;
  category: string | null;
  story: string | null;
  designer_name: string | null;
  location: string | null;
  badge: "ready-made" | "bespoke" | "ready+bespoke" | null;
  style_tags: string[] | null;
  feed_layout: FeedLook["feedLayout"];
  is_editorial_break: boolean | null;
  editorial_label: string | null;
  media_type: "image" | "video" | null;
  video_url: string | null;
  promo_text: string | null;
};

const PANEL_COLUMNS =
  "id, label, image_url, href, category, story, designer_name, location, badge, style_tags, feed_layout, is_editorial_break, editorial_label, media_type, video_url, promo_text";

async function getAllPanels(): Promise<PanelRow[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_lookbook_panels")
    .select(PANEL_COLUMNS)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return data as unknown as PanelRow[];
}

function toFeedLook(row: PanelRow): FeedLook {
  return {
    id: row.id,
    label: row.label,
    image: row.image_url,
    href: `/look/${row.id}`,
    designerName: row.designer_name,
    location: row.location,
    badge: row.badge,
    category: row.category,
    styleTags: row.style_tags ?? [],
    feedLayout: row.feed_layout,
    isEditorialBreak: row.is_editorial_break ?? false,
    editorialLabel: row.editorial_label,
    mediaType: row.media_type ?? "image",
    videoUrl: row.video_url,
    promoText: row.promo_text,
  };
}

const fallbackHeroLooks: EditorialHeroLook[] = [fallbackHero];

// Home's hero comes from ariana_shop_hero — the same admin section
// ("Shop Hero") that used to render on /catalog. It's been moved here on
// request: it's part of the e-commerce PWA's Home feed now, not the Shop
// grid. This has nothing to do with ariana_hero_banners ("Hero Looks"),
// which stays exactly where it was — the separate marketing landing page.
async function getShopHeroLooks(): Promise<EditorialHeroLook[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_shop_hero")
    .select("id, label, image_url, href")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error || !data || data.length === 0) return fallbackHeroLooks;

  return data.map((row) => ({
    id: row.id,
    image: row.image_url,
    label: row.label ?? "The Season, Reimagined",
    mediaType: "image" as const,
    ctaText: "Shop Now",
    ctaHref: row.href ?? "/catalog",
  }));
}

async function getHomeData(): Promise<{ heroLooks: EditorialHeroLook[]; looks: FeedLook[] }> {
  const [panels, heroLooks] = await Promise.all([getAllPanels(), getShopHeroLooks()]);
  const looks = panels.map(toFeedLook);
  return { heroLooks, looks };
}

// ---------- Landing (marketing/ecommerce showcase page) ----------

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

async function getLandingData() {
  const [desktopBanners, mobileBanners, newArrivals, lookbookPanels] = await Promise.all([
    getHeroBanners("desktop"),
    getHeroBanners("mobile"),
    getNewArrivals(),
    getLandingLookbookPanels(),
  ]);
  return { desktopBanners, mobileBanners, newArrivals, lookbookPanels };
}

// ---------- Root route: fetch both, let the client decide which to show ----------
// Installed as a PWA (Add to Home Screen) → Home (editorial lookbook).
// Regular browser tab → the marketing landing page. Same URL, deliberately
// different audiences — see HomeOrLandingGate and StorefrontChrome.

export default async function RootPage() {
  const [{ heroLooks, looks }, { desktopBanners, mobileBanners, newArrivals, lookbookPanels }] = await Promise.all([
    getHomeData(),
    getLandingData(),
  ]);

  return (
    <HomeOrLandingGate
      heroLooks={heroLooks}
      looks={looks}
      desktopBanners={desktopBanners}
      mobileBanners={mobileBanners}
      lookbookPanels={lookbookPanels}
      newArrivals={newArrivals}
    />
  );
}
