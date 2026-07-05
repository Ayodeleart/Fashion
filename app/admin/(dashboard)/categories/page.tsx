import { createAdminClient } from "@/lib/supabase-admin";
import CategoryManager from "@/components/admin/CategoryManager";

export const dynamic = "force-dynamic";

async function getCategories() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_categories")
    .select("id, name, slug, thumbnail_url, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    thumbnailUrl: row.thumbnail_url as string | null,
    position: row.position,
  }));
}

export default async function CategoriesAdminPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-2">Categories</h1>
      <p className="text-sm text-muted mb-6">
        These power both the &ldquo;Shop by Categories&rdquo; row on the storefront home page and the
        category dropdown when creating/editing products.
      </p>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
