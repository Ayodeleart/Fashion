import { getSupabase } from "@/lib/supabase";
import ReelVideoFeed, { type FeedReel } from "@/components/ReelVideoFeed";

export const dynamic = "force-dynamic";

type ReelRow = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  like_count: number;
  ariana_products: { slug: string; name: string } | null;
};

async function getReelsForCategory(categorySlug: string): Promise<{ reels: FeedReel[]; error: string | null }> {
  const supabase = getSupabase();
  const baseQuery = supabase
    .from("ariana_reels")
    .select("id, video_url, thumbnail_url, caption, like_count, ariana_products(slug, name)")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  let query;
  if (categorySlug === "uncategorized") {
    query = baseQuery.is("category_id", null);
  } else {
    const { data: category, error: categoryError } = await supabase
      .from("ariana_categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (categoryError) {
      console.error("Category lookup failed:", categoryError.message);
      return { reels: [], error: categoryError.message };
    }
    if (!category) return { reels: [], error: null };
    query = baseQuery.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Reel feed fetch failed:", error.message);
    return { reels: [], error: error.message };
  }

  const rows = (data as unknown as ReelRow[]) ?? [];
  return {
    reels: rows.map((r) => ({
      id: r.id,
      video_url: r.video_url,
      thumbnail_url: r.thumbnail_url,
      caption: r.caption,
      like_count: r.like_count ?? 0,
      product_slug: r.ariana_products?.slug ?? null,
      product_name: r.ariana_products?.name ?? null,
    })),
    error: null,
  };
}

export default async function ReelsCategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ start?: string }>;
}) {
  const { category } = await params;
  const { start } = await searchParams;
  const { reels, error } = await getReelsForCategory(category);

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-red-400">Couldn&apos;t load this feed: {error}</p>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-white/70">No reels in this category yet.</p>
      </main>
    );
  }

  return <ReelVideoFeed reels={reels} startId={start ?? null} />;
}
