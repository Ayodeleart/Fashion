import Hero, { HeroBanner } from "@/components/Hero";
import Lookbook, { LookbookPanel } from "@/components/Lookbook";
import { getSupabase } from "@/lib/supabase";

// Home is the digital style book — inspiration only. No prices, no product
// grid, no "add to cart", no landing-page chrome (no footer, no About/
// Contact) anywhere on this page. Each category below is its own chapter
// (eyebrow + heading), rendered in this fixed reading order. A category
// with zero published panels is skipped rather than shown empty.
const CATEGORY_ORDER = [
  "seasonal",
  "wedding",
  "celebrity",
  "aso-oke",
  "corporate",
  "streetwear",
  "couple",
  "traditional",
  "designer-spotlight",
] as const;

type Category = (typeof CATEGORY_ORDER)[number];

const CATEGORY_COPY: Record<Category, { eyebrow: string; heading: string }> = {
  seasonal: { eyebrow: "This season's edit", heading: "Three ways to wear the season" },
  wedding: { eyebrow: "Wedding inspiration", heading: "Say I do in style" },
  celebrity: { eyebrow: "Celebrity looks", heading: "As seen on the red carpet" },
  "aso-oke": { eyebrow: "Luxury aso oke", heading: "Heritage, rewoven" },
  corporate: { eyebrow: "Corporate fits", heading: "Boardroom ready" },
  streetwear: { eyebrow: "Streetwear", heading: "Off-duty, on-brand" },
  couple: { eyebrow: "Couple styles", heading: "Matching, not matchy" },
  traditional: { eyebrow: "Traditional styles", heading: "Rooted in craft" },
  "designer-spotlight": { eyebrow: "Designer spotlight", heading: "Meet the hands behind the thread" },
};

// Forced dynamic: without this, Next.js can prerender this page as static
// HTML at build time and cache it — meaning new hero banners, lookbook
// panels, or products published afterward via /admin wouldn't show up
// until the next deployment, regardless of revalidatePath calls. Always
// fetch live on every request instead.
export const dynamic = "force-dynamic";

// FALLBACK — only used until a banner is published from /admin/hero, or
// if the Supabase fetch fails. Kept separate per device, no substitution.
const fallbackDesktopBanners: HeroBanner[] = [
  { id: "fallback-desktop", imageUrl: "/images/hero-desktop.jpg" },
];
const fallbackMobileBanners: HeroBanner[] = [
  { id: "fallback-mobile", imageUrl: "/images/hero-mobile.jpg" },
];

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

type PanelRow = {
  id: string;
  label: string;
  image_url: string;
  href: string;
  story: string | null;
  category: string | null;
};

const fallbackRows: PanelRow[] = [
  { id: "look-1", label: "The Tailored Line", image_url: "/images/look-1.jpg", href: "/catalog?look=tailored", story: null, category: "seasonal" },
  { id: "look-2", label: "Evening", image_url: "/images/look-2.jpg", href: "/catalog?look=evening", story: null, category: "seasonal" },
  { id: "look-3", label: "Off-Duty", image_url: "/images/look-3.jpg", href: "/catalog?look=off-duty", story: null, category: "seasonal" },
];

// Requires the "category" and "story" columns on ariana_lookbook_panels —
// see the migration note in the admin/lookbook page. A panel whose category
// doesn't match a known chapter falls back to "seasonal" so a typo in
// Supabase never silently drops content from the page.
async function getLookbookPanelsByCategory(): Promise<Record<Category, LookbookPanel[]>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, href, story, category")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const grouped: Record<Category, LookbookPanel[]> = {
    seasonal: [], wedding: [], celebrity: [], "aso-oke": [], corporate: [],
    streetwear: [], couple: [], traditional: [], "designer-spotlight": [],
  };

  const rows: PanelRow[] = !error && data && data.length > 0 ? (data as PanelRow[]) : fallbackRows;

  for (const row of rows) {
    const category: Category = (CATEGORY_ORDER as readonly string[]).includes(row.category ?? "")
      ? (row.category as Category)
      : "seasonal";
    grouped[category].push({
      id: row.id,
      label: row.label,
      image: row.image_url,
      href: row.href,
      story: row.story ?? undefined,
    });
  }

  return grouped;
}

export default async function Home() {
  const [desktopBanners, mobileBanners, panelsByCategory] = await Promise.all([
    getHeroBanners("desktop"),
    getHeroBanners("mobile"),
    getLookbookPanelsByCategory(),
  ]);

  return (
    <main>
      <Hero desktopBanners={desktopBanners} mobileBanners={mobileBanners} />

      {CATEGORY_ORDER.map((category) => {
        const panels = panelsByCategory[category];
        if (panels.length === 0) return null;
        const { eyebrow, heading } = CATEGORY_COPY[category];
        return <Lookbook key={category} eyebrow={eyebrow} heading={heading} panels={panels} />;
      })}
    </main>
  );
}
