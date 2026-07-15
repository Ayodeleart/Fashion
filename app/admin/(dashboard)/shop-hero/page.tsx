import { createAdminClient } from "@/lib/supabase-admin";
import { getCategories } from "@/lib/categories";
import ShopHeroManager from "@/components/admin/ShopHeroManager";

export const dynamic = "force-dynamic";

async function getShopHero() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_shop_hero")
    .select("id, label, image_url, href, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });

  return (data ?? []).map((row) => ({
    id: row.id,
    label: row.label as string | null,
    imageUrl: row.image_url as string,
    href: row.href as string | null,
  }));
}

export default async function ShopHeroAdminPage() {
  const [banners, categories] = await Promise.all([getShopHero(), getCategories()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-2">Shop Hero</h1>
      <p className="text-sm text-muted mb-6">
        This is Home&apos;s hero — the big first-screen image at the top of the app (/) — separate from
        the marketing landing page&apos;s Hero Looks. The most recent one shows; add another to replace it.
        Portrait images work best (roughly 4:5). Pick a link destination below so &ldquo;Shop now&rdquo;
        always goes somewhere real.
      </p>
      <ShopHeroManager initialBanners={banners} categories={categories} />
    </div>
  );
}
