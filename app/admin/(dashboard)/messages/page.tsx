import { createAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

async function getMessages() {
  const admin = createAdminClient();
  const { data } = await admin
    .from("ariana_contact_messages")
    .select("id, name, email, message, created_at")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function AdminMessagesPage() {
  const messages = await getMessages();

  return (
    <div>
      <h1 className="font-display text-3xl mb-2">Messages</h1>
      <p className="text-sm text-muted mb-8 max-w-lg">Submissions from the /contact page.</p>

      {messages.length === 0 ? (
        <p className="text-sm text-muted">No messages yet.</p>
      ) : (
        <div className="space-y-4 max-w-2xl">
          {messages.map((m) => (
            <div key={m.id} className="border border-ink/10 rounded p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">{m.name}</p>
                <p className="text-xs text-muted">{new Date(m.created_at).toLocaleString()}</p>
              </div>
              <a href={`mailto:${m.email}`} className="text-xs text-brass hover:underline">
                {m.email}
              </a>
              <p className="text-sm mt-2 whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
