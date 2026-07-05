"use client";

import { useState } from "react";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
        body: JSON.stringify({ name, email, message }),
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
      <p className="text-paper/90 border border-paper/30 rounded-sm px-5 py-4 text-sm">
        Thanks — your message is in. We'll get back to you soon.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-300 bg-red-950/40 border border-red-400/30 rounded-sm p-3">{error}</p>}
      <div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          required
          className="w-full bg-transparent border-b border-paper/40 text-paper placeholder:text-paper/50 px-1 py-2 focus:outline-none focus:border-brass"
        />
      </div>
      <div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full bg-transparent border-b border-paper/40 text-paper placeholder:text-paper/50 px-1 py-2 focus:outline-none focus:border-brass"
        />
      </div>
      <div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you're looking for — fitting, bespoke order, general question..."
          rows={4}
          required
          className="w-full bg-transparent border-b border-paper/40 text-paper placeholder:text-paper/50 px-1 py-2 focus:outline-none focus:border-brass resize-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === "sending"}
        className="text-sm tracking-wide text-paper border border-paper/60 px-6 py-3 rounded-sm hover:bg-paper hover:text-ink transition-colors disabled:opacity-50"
      >
        {status === "sending" ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
