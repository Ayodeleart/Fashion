"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Announcement = { id: string; message: string; enabled: boolean; position: number };

export default function AnnouncementsManager({ initial }: { initial: Announcement[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    setPending(true);
    setError(null);
    const res = await fetch("/api/admin/announcements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const result: { error?: string } = await res.json();
    setPending(false);
    if (result.error) return setError(result.error);
    setMessage("");
    router.refresh();
  }

  async function toggleEnabled(item: Announcement) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, enabled: !i.enabled } : i)));
    await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, enabled: !item.enabled }),
    });
  }

  async function editMessage(item: Announcement) {
    const next = prompt("Edit message", item.message);
    if (!next || !next.trim() || next.trim() === item.message) return;
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, message: next.trim() } : i)));
    await fetch("/api/admin/announcements", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, message: next.trim() }),
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this message?")) return;
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleAdd} className="flex gap-2">
        {error && <p className="text-sm text-red-700 w-full">{error}</p>}
        <input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="New Luxury Collection Available"
          className="flex-1 border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
        <button type="submit" disabled={pending} className="bg-ink text-white text-sm rounded px-4 py-2 disabled:opacity-50">
          Add
        </button>
      </form>

      <ul className="divide-y divide-ink/10 border border-ink/10 rounded-lg">
        {items.length === 0 && <li className="p-4 text-sm text-muted">No messages yet.</li>}
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 p-3">
            <span className={`flex-1 text-sm ${item.enabled ? "" : "text-muted line-through"}`}>{item.message}</span>
            <button onClick={() => toggleEnabled(item)} className="text-xs px-2 py-1 rounded hover:bg-ink/5 transition-colors">
              {item.enabled ? "On" : "Off"}
            </button>
            <button onClick={() => editMessage(item)} className="text-xs px-2 py-1 rounded hover:bg-ink/5 transition-colors">
              Edit
            </button>
            <button onClick={() => handleDelete(item.id)} className="text-xs px-2 py-1 rounded text-red-700 hover:bg-red-50 transition-colors">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
