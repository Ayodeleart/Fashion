import LookbookUploadForm from "@/components/admin/LookbookUploadForm";
import DeleteLookbookPanelButton from "@/components/admin/DeleteLookbookPanelButton";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getPanels() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_lookbook_panels")
    .select(
      "id, label, image_url, category, story, position, created_at, designer_name, badge, is_editorial_break, editorial_label, media_type"
    )
    .order("category", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });
  return data ?? [];
}

export default async function AdminLookbookPage() {
  const panels = await getPanels();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Lookbook</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">
        This is the Home style book — pure inspiration, no prices. Every look you add here
        appears as a tile in the Home feed. Tapping a tile opens the full look with designer
        info, similar styles, and Shop/Bespoke/Enquiry actions.
      </p>

      {panels.length > 0 && (
        <div className="mb-10">
          <p className="text-sm font-medium mb-3">Current looks ({panels.length})</p>
          <div className="flex flex-wrap gap-4">
            {panels.map((panel) => (
              <div key={panel.id} className="w-32">
                <div className="w-32 h-40 rounded overflow-hidden border border-ink/10 bg-paper-raised relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={panel.image_url} alt={panel.label} className="w-full h-full object-cover" />
                  {panel.media_type === "video" && (
                    <span className="absolute top-1 right-1 bg-brass text-ink text-[9px] px-1.5 py-0.5 rounded">
                      VIDEO
                    </span>
                  )}
                </div>
                <p className="text-xs mt-1 truncate">{panel.label}</p>
                <p className="text-[11px] text-muted truncate">{panel.category ?? "seasonal"}</p>
                {panel.designer_name && (
                  <p className="text-[11px] text-muted truncate">{panel.designer_name}</p>
                )}
                {panel.is_editorial_break && (
                  <p className="text-[10px] text-brass truncate">Breaks: {panel.editorial_label}</p>
                )}
                <DeleteLookbookPanelButton id={panel.id} />
              </div>
            ))}
          </div>
        </div>
      )}

      <LookbookUploadForm />
    </div>
  );
}
