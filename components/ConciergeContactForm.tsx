"use client";

import { useState } from "react";

export type ConciergeContactSource = "ai_complaint" | "ai_handoff" | "reel_send";

export default function ConciergeContactForm({
  source,
  placeholder,
  reelId,
  defaultMessage,
  onSent,
}: {
  source: ConciergeContactSource;
  placeholder: string;
  reelId?: string;
  defaultMessage?: string;
  onSent: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(defaultMessage ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message, source, reelId }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSent(true);
        setTimeout(onSent, 1200);
      }
    } catch {
      setError("Couldn't send that — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return <p className="text-sm bg-paper-raised rounded-2xl px-4 py-4">Got it — we'll be in touch shortly.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="bg-paper-raised rounded-full px-4 py-3 text-sm outline-none placeholder:text-muted"
      />
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        required
        className="bg-paper-raised rounded-full px-4 py-3 text-sm outline-none placeholder:text-muted"
      />
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        required
        rows={3}
        className="bg-paper-raised rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted resize-none"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-ink text-paper rounded-full py-3 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Sending…" : "Send"}
      </button>
    </form>
  );
}
