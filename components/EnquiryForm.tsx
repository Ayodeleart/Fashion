"use client";

import { useState } from "react";
import AiComposeChat from "@/components/AiComposeChat";

export default function EnquiryForm({
  lookId,
  productId,
  contextLabel,
}: {
  lookId?: string;
  productId?: string;
  contextLabel?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(contextLabel ? `Regarding: ${contextLabel}\n\n` : "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, lookId, productId, source: "enquiry" }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);
      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Send failed.");
      setStatus("idle");
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-md mx-auto md:mx-0 text-center md:text-left py-12">
        <h2 className="font-display text-2xl mb-2">Message sent</h2>
        <p className="text-muted">
          Thanks, {name.split(" ")[0] || "there"} — we&apos;ve got your message and will reply directly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-1">Make an enquiry</h1>
          <p className="text-sm text-muted">Questions about a piece, sizing, or anything else — send us a note and we&apos;ll reply directly.</p>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
          required
          className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (optional)"
            className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like to ask?"
          rows={6}
          required
          className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 resize-none"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full h-12 rounded-full bg-ink text-paper text-sm font-medium disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Send enquiry"}
        </button>
      </form>

      <div className="md:sticky md:top-24">
        <AiComposeChat
          mode="enquiry"
          context={contextLabel}
          onUseDraft={(text) => setMessage(text)}
        />
      </div>
    </div>
  );
}
