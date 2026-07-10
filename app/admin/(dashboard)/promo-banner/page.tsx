import { createAdminClient } from "@/lib/supabase-admin";
import PromoBannerForm from "@/components/admin/PromoBannerForm";

export const dynamic = "force-dynamic";

async function getBanner() {
  const admin = createAdminClient();
  const { data } = await admin.from("ariana_promo_banner").select("*").eq("id", 1).single();
  return data;
}

export default async function PromoBannerAdminPage() {
  const banner = await getBanner();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Promo Banner</h1>
      <p className="text-sm text-muted mb-6">
        Shown as a popup to shoppers shortly after opening the app, or after they scroll a bit —
        once per visit. Turn it off any time.
      </p>
      <PromoBannerForm initial={banner} />
    </div>
  );
}
