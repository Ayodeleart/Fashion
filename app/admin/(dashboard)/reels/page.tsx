import { createAdminClient } from "@/lib/supabase-admin";
import ReelsManager from "@/components/admin/ReelsManager";

export const dynamic = "force-dynamic";

async function getReels() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_reels")
    .select("id, video_url, thumbnail_url, caption, product_id, position")
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return data ?? [];
}

async function getProducts() {
  const admin = createAdminClient();
  const { data } = await admin.from("ariana_products").select("id, name").order("name");
  return data ?? [];
}

export default async function ReelsAdminPage() {
  const [reels, products] = await Promise.all([getReels(), getProducts()]);

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-2">Reels</h1>
      <p className="text-sm text-muted mb-6">
        Short vertical videos shown in the shop&apos;s Reels tab (/reels). Optionally link one to a
        product so a &ldquo;Shop&rdquo; button appears over the video.
      </p>
      <ReelsManager initialReels={reels} products={products} />
    </div>
  );
}
