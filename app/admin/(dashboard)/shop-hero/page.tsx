import { createAdminClient } from "@/lib/supabase-admin";
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
  const banners = await getShopHero();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-2">Shop Hero</h1>
      <p className="text-sm text-muted mb-6">
        This is the rounded hero card on the mobile shop home (/catalog) — separate from the editorial
        site&apos;s Hero Looks. Portrait images work best (roughly 4:5).
      </p>
      <ShopHeroManager initialBanners={banners} />
    </div>
  );
}
