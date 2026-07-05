import HeroBannerUploadForm from "@/components/admin/HeroBannerUploadForm";
import DeleteHeroBannerButton from "@/components/admin/DeleteHeroBannerButton";
import SetDefaultBannerButton from "@/components/admin/SetDefaultBannerButton";
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
      {banners.map((banner, i) => (
        <div key={banner.id} className="w-56">
          <div className="w-56 h-32 rounded overflow-hidden border border-ink/10 bg-paper-raised relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.image_url} alt={banner.label} className="w-full h-full object-cover" />
            {i === 0 && (
              <span className="absolute top-1 left-1 bg-brass text-ink text-[10px] px-1.5 py-0.5 rounded">
                Default (shows first)
              </span>
            )}
          </div>
          <p className="text-xs mt-1 truncate">{banner.label}</p>
          <div className="flex items-center gap-3 mt-1">
            {i !== 0 && <SetDefaultBannerButton id={banner.id} />}
            <DeleteHeroBannerButton id={banner.id} />
          </div>
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
        neither ever substitutes for the other. Multiple banners auto-rotate with a crossfade on
        the live site. The one marked &ldquo;Default&rdquo; always shows first — use &ldquo;Set as
        default&rdquo; on any other banner to promote it. Brand name and any text should already
        be baked into the image; the optional tagline/CTA fields below render as a small overlay
        on top of it.
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
