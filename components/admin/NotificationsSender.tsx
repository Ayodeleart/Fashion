"use client";

import { useState } from "react";

export default function NotificationsSender() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/");
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(`Sent to ${data.sent}/${data.total} subscribers.${data.removed ? ` Removed ${data.removed} expired.` : ""}`);
      setTitle("");
      setBody("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}
      {result && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">{result}</p>}

      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          placeholder="New arrivals just dropped"
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Message</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          placeholder="Check out the new Aso Oke collection"
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white resize-none"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Link (opened on tap)</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="/catalog"
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <button type="submit" disabled={pending} className="bg-ink text-white text-sm rounded px-5 py-2.5 disabled:opacity-50">
        {pending ? "Sending…" : "Send to all subscribers"}
      </button>
    </form>
  );
}
