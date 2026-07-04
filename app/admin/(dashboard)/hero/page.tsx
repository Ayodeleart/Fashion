import HeroBannerUploadForm from "@/components/admin/HeroBannerUploadForm";
import DeleteHeroBannerButton from "@/components/admin/DeleteHeroBannerButton";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

type BannerRow = { id: string; label: string; image_url: string; device: "desktop" | "mobile" };

async function getPublishedBanners(device: "desktop" | "mobile"): Promise<BannerRow[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_hero_banners")
    .select("id, label, image_url, device")
    .eq("status", "published")
    .eq("device", device)
    .order("position", { ascending: true })
    .order("created_at", { ascending: false });
  return (data as BannerRow[]) ?? [];
}

function BannerList({ banners }: { banners: BannerRow[] }) {
  if (banners.length === 0) return <p className="text-sm text-muted mb-6">None published yet.</p>;
  return (
    <div className="flex flex-wrap gap-6 mb-8">
      {banners.map((banner) => (
        <div key={banner.id} className="w-56">
          <div className="w-56 h-32 rounded overflow-hidden border border-ink/10 bg-paper-raised">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.image_url} alt={banner.label} className="w-full h-full object-cover" />
          </div>
          <p className="text-xs mt-1 truncate">{banner.label}</p>
          <DeleteHeroBannerButton id={banner.id} />
        </div>
      ))}
    </div>
  );
}

export default async function AdminHeroPage() {
  const [desktopBanners, mobileBanners] = await Promise.all([
    getPublishedBanners("desktop"),
    getPublishedBanners("mobile"),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Hero Banners</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        Desktop and mobile are completely separate — each has its own list, its own order, and
        neither ever substitutes for the other. Upload as many as you want per device; multiple
        banners get manual dot navigation with a crossfade on the live site (no auto-slide).
        Brand name and any text should already be baked into the image — uploaded exactly as-is.
      </p>

      <section className="mb-12">
        <h2 className="font-display text-xl mb-3">Desktop</h2>
        <BannerList banners={desktopBanners} />
        <HeroBannerUploadForm device="desktop" />
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Mobile</h2>
        <BannerList banners={mobileBanners} />
        <HeroBannerUploadForm device="mobile" />
      </section>
    </div>
  );
}
