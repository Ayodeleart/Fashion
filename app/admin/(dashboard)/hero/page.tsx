import HeroUploadWorkflow from "@/components/admin/HeroUploadWorkflow";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getPublishedLooks() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_hero_looks")
    .select("id, label, image_middle_url, bg_color, created_at")
    .eq("status", "published")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminHeroPage() {
  const looks = await getPublishedLooks();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Hero Looks</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        Upload up to 3 images (middle is required — it's the only one shown
        on mobile). Backgrounds are removed automatically in your browser,
        then the cutouts publish over your chosen hero color.
      </p>

      {looks.length > 0 && (
        <div className="mb-10">
          <p className="text-sm font-medium mb-3">Currently published ({looks.length})</p>
          <div className="flex flex-wrap gap-4">
            {looks.map((look) => (
              <div key={look.id} className="w-28">
                <div
                  className="w-28 h-36 rounded overflow-hidden border border-ink/10 flex items-end justify-center"
                  style={{ backgroundColor: `rgb(${look.bg_color})` }}
                >
                  {look.image_middle_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={look.image_middle_url} alt={look.label} className="h-full w-auto object-contain" />
                  )}
                </div>
                <p className="text-xs mt-1 truncate">{look.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <HeroUploadWorkflow />
    </div>
  );
}
