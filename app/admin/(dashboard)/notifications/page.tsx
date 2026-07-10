import { createAdminClient } from "@/lib/supabase-admin";
import NotificationsSender from "@/components/admin/NotificationsSender";

export const dynamic = "force-dynamic";

async function getSubscriberCount() {
  const admin = createAdminClient();
  const { count } = await admin
    .from("ariana_push_subscriptions")
    .select("id", { count: "exact", head: true });
  return count ?? 0;
}

export default async function NotificationsPage() {
  const count = await getSubscriberCount();

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-2">Notifications</h1>
      <p className="text-sm text-muted mb-6">
        Send a push notification to everyone who has enabled notifications (currently{" "}
        <strong>{count}</strong> subscriber{count === 1 ? "" : "s"}). Only people who tapped the bell
        icon and granted permission receive these — this doesn't touch anyone else.
      </p>
      <NotificationsSender />
    </div>
  );
}
