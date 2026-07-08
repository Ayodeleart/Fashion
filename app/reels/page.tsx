import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { PlayIcon } from "@/components/ReelIcons";

export const dynamic = "force-dynamic";

type GridReel = {
  id: string;
  thumbnail_url: string | null;
  video_url: string;
  category_slug: string;
};

type ReelRow = {
  id: string;
  thumbnail_url: string | null;
  video_url: string;
  ariana_categories: { slug: string } | null;
};

async function getReels(): Promise<{ reels: GridReel[]; error: string | null }> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_reels")
    .select("id, thumbnail_url, video_url, ariana_categories(slug)")
    .eq("status", "published")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Reels grid fetch failed:", error.message);
    return { reels: [], error: error.message };
  }

  const rows = (data as unknown as ReelRow[]) ?? [];
  return {
    reels: rows.map((r) => ({
      id: r.id,
      thumbnail_url: r.thumbnail_url,
      video_url: r.video_url,
      category_slug: r.ariana_categories?.slug ?? "uncategorized",
    })),
    error: null,
  };
}

export default async function ReelsPage() {
  const { reels, error } = await getReels();

  if (error) {
    return (
      <main className="h-screen flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-red-400">Couldn&apos;t load reels: {error}</p>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="h-screen flex items-center justify-center bg-black px-6 text-center">
        <p className="text-sm text-white/70">No reels yet — check back soon.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <div className="grid grid-cols-3 gap-0.5">
        {reels.map((reel) => (
          <Link
            key={reel.id}
            href={`/reels/${reel.category_slug}?start=${reel.id}`}
            className="relative aspect-[3/4] bg-ink"
          >
            {reel.thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={reel.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <video
                src={`${reel.video_url}#t=0.1`}
                className="w-full h-full object-cover"
                muted
                playsInline
                preload="metadata"
              />
            )}
            <PlayIcon className="absolute top-2 right-2 w-6 h-6" />
          </Link>
        ))}
      </div>
    </main>
  );
}

