import { getSupabase } from "@/lib/supabase";

export type Category = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  position: number;
};

/**
 * Categories used to be a hardcoded const array (lib/product-categories.ts).
 * They're now admin-editable, stored in ariana_categories with a public
 * read policy — so this can be called from client or server components
 * alike using the anon key.
 */
export async function getCategories(): Promise<Category[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("ariana_categories")
    .select("id, name, slug, thumbnail_url, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    thumbnailUrl: row.thumbnail_url,
    position: row.position,
  }));
}

export function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
