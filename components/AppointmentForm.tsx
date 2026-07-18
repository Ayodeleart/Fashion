"use client";

import { useState } from "react";
import AiComposeChat from "@/components/AiComposeChat";

const GENERIC_SERVICES = ["Consultation", "Fitting", "Bespoke Order", "Alteration", "Bridal/Wedding Styling"];

export default function AppointmentForm({
  serviceOptions,
  lookId,
  productId,
  contextLabel,
}: {
  serviceOptions: string[];
  lookId?: string;
  productId?: string;
  contextLabel?: string;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [message, setMessage] = useState(contextLabel ? `Regarding: ${contextLabel}\n\n` : "");
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  const allServices = [...new Set([...GENERIC_SERVICES, ...serviceOptions])];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          serviceType,
          preferredDate,
          preferredTime,
          lookId,
          productId,
          source: "appointment",
        }),
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
        <h2 className="font-display text-2xl mb-2">Request sent</h2>
        <p className="text-muted">
          Thanks, {name.split(" ")[0] || "there"} — we&apos;ve got your appointment request and will confirm a time with you shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <h1 className="font-display text-2xl md:text-3xl mb-1">Book an appointment</h1>
          <p className="text-sm text-muted">Tell us what you need — a fitting, consultation, bespoke order, or alteration — and we&apos;ll confirm a time.</p>
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
            placeholder="Phone"
            className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
          />
        </div>

        <select
          value={serviceType}
          onChange={(e) => setServiceType(e.target.value)}
          required
          className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 text-ink"
        >
          <option value="">What&apos;s this for?</option>
          {allServices.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
          />
          <input
            type="time"
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40"
          />
        </div>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Anything else we should know?"
          rows={4}
          required
          className="w-full bg-paper-raised border border-ink/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-ink/40 resize-none"
        />

        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full h-12 rounded-full bg-ink text-paper text-sm font-medium disabled:opacity-50"
        >
          {status === "sending" ? "Sending…" : "Request appointment"}
        </button>
      </form>

      <div className="md:sticky md:top-24">
        <AiComposeChat
          mode="appointment"
          context={contextLabel}
          onUseDraft={(text) => setMessage(text)}
        />
      </div>
    </div>
  );
}
