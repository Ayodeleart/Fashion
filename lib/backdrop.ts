import { getSupabase } from "@/lib/supabase";

/**
 * Reuses whatever the default (first) published desktop hero banner is
 * as the backdrop photo for content pages like About/Contact — same
 * source of truth as the homepage hero, no separate upload needed.
 * Falls back to a plain brand-green panel (no image) if none exist yet.
 */
export async function getBackdropImage(): Promise<string | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_hero_banners")
    .select("image_url")
    .eq("status", "published")
    .eq("device", "desktop")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data?.image_url ?? null;
}
