import { createAdminClient } from "@/lib/supabase-admin";
import AnnouncementsManager from "@/components/admin/AnnouncementsManager";

export const dynamic = "force-dynamic";

async function getAnnouncements() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_announcements")
    .select("id, message, enabled, position")
    .order("position", { ascending: true });
  return data ?? [];
}

export default async function AnnouncementsAdminPage() {
  const announcements = await getAnnouncements();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Announcement Bar</h1>
      <p className="text-sm text-muted mb-6">
        The rotating strip of text at the very top of the Home tab. Add, edit, or turn off individual
        messages — they rotate through in order.
      </p>
      <AnnouncementsManager initial={announcements} />
    </div>
  );
}
