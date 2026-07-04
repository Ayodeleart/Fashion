import HeroBannerUploadForm from "@/components/admin/HeroBannerUploadForm";
import DeleteHeroBannerButton from "@/components/admin/DeleteHeroBannerButton";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getPublishedBanners() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_hero_banners")
    .select("id, label, image_desktop_url, image_mobile_url, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminHeroPage() {
  const banners = await getPublishedBanners();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Hero Banner</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        Upload the fully designed hero image for desktop and mobile — brand name and any text
        already baked in. Uploaded exactly as-is, no processing.
      </p>

      {banners.length > 0 && (
        <div className="mb-10">
          <p className="text-sm font-medium mb-3">Currently published ({banners.length})</p>
          <div className="flex flex-wrap gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="w-56">
                <div className="w-56 h-32 rounded overflow-hidden border border-ink/10 bg-paper-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={banner.image_desktop_url}
                    alt={banner.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-xs mt-1 truncate">{banner.label}</p>
                <DeleteHeroBannerButton id={banner.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <HeroBannerUploadForm />
    </div>
  );
}
