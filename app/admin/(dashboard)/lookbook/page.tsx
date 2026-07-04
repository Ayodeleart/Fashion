import LookbookUploadForm from "@/components/admin/LookbookUploadForm";
import DeleteLookbookPanelButton from "@/components/admin/DeleteLookbookPanelButton";
import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getPanels() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, position, created_at")
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
        The three panels in the &ldquo;Three ways to wear the season&rdquo; section on the
        homepage. Add or remove panels here.
      </p>

      {panels.length > 0 && (
        <div className="mb-10">
          <p className="text-sm font-medium mb-3">Current panels ({panels.length})</p>
          <div className="flex flex-wrap gap-4">
            {panels.map((panel) => (
              <div key={panel.id} className="w-32">
                <div className="w-32 h-40 rounded overflow-hidden border border-ink/10 bg-paper-raised">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={panel.image_url} alt={panel.label} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs mt-1 truncate">{panel.label}</p>
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
