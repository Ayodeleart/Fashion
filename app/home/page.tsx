import AnnouncementBar from "@/components/home/AnnouncementBar";
import EditorialHero, { type EditorialHeroLook } from "@/components/home/EditorialHero";
import HomeFeed, { type FeedLook } from "@/components/home/HomeFeed";
import { getSupabase } from "@/lib/supabase";

// Same reasoning as before: without this, newly published looks from
// /admin wouldn't show until the next deploy.
export const dynamic = "force-dynamic";

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
  is_hero: boolean | null;
  media_type: "image" | "video" | null;
  video_url: string | null;
  promo_text: string | null;
};

const PANEL_COLUMNS =
  "id, label, image_url, href, category, story, designer_name, location, badge, style_tags, feed_layout, is_editorial_break, editorial_label, is_hero, media_type, video_url, promo_text";

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

function toHeroLook(row: PanelRow): EditorialHeroLook {
  return {
    id: row.id,
    image: row.image_url,
    label: row.label,
    mediaType: row.media_type ?? "image",
    videoUrl: row.video_url,
    promoText: row.promo_text,
    ctaText: "Explore The Edit",
    ctaHref: `/look/${row.id}`,
  };
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

export default async function Home() {
  const panels = await getAllPanels();

  // Home's hero is a look from the SAME lookbook table — never the
  // landing page's ariana_hero_banners. Admin flags one look with
  // is_hero; if none is flagged, the first published look stands in.
  const heroRow = panels.find((p) => p.is_hero) ?? panels[0];
  const heroLook = heroRow ? toHeroLook(heroRow) : fallbackHero;

  // The hero doesn't repeat in the feed below it — the "feature" blocks
  // (feed_layout: "feature") are how a look/video/promo shows up again
  // mid-scroll, placed exactly where the admin sets its position.
  const looks = panels.filter((p) => p.id !== heroRow?.id).map(toFeedLook);

  return (
    <main>
      <AnnouncementBar />
      <EditorialHero look={heroLook} />
      <HomeFeed looks={looks} />
    </main>
  );
}
