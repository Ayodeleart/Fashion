"use client";

import { useState } from "react";
import Link from "next/link";

type View = "menu" | "design" | "complaint" | "handoff";

export default function AriaSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [view, setView] = useState<View>("menu");

  function handleClose() {
    onClose();
    // Reset after the close transition finishes, not before — otherwise
    // the sub-view flashes back to the menu while still visibly sliding down.
    setTimeout(() => setView("menu"), 200);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close"
        onClick={handleClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="absolute bottom-0 left-0 right-0 bg-paper rounded-t-3xl max-w-md mx-auto max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-paper flex items-center justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-2">
            {view !== "menu" && (
              <button onClick={() => setView("menu")} aria-label="Back" className="text-muted">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
            <h2 className="text-base font-semibold">
              {view === "menu" && "Hi, I'm Aria"}
              {view === "design" && "Design & color ideas"}
              {view === "complaint" && "What went wrong?"}
              {view === "handoff" && "Talk to a human"}
            </h2>
          </div>
          <button onClick={handleClose} aria-label="Close" className="text-muted">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="px-5 pb-8">
          {view === "menu" && <MenuView onSelect={setView} />}
          {view === "design" && <DesignView />}
          {view === "complaint" && <ContactForm source="ai_complaint" onSent={handleClose} placeholder="Tell me what happened — order number helps if you have it." />}
          {view === "handoff" && <ContactForm source="ai_handoff" onSent={handleClose} placeholder="What would you like to talk to us about? We'll reach out." />}
        </div>
      </div>
    </div>
  );
}

function MenuOption({ label, sub, onClick }: { label: string; sub: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between gap-3 bg-paper-raised rounded-2xl px-4 py-4 text-left"
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted mt-0.5">{sub}</p>
      </div>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function MenuView({ onSelect }: { onSelect: (v: View) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <Link href="/account/measurements">
        <MenuOption
          label="Don't know your measurements?"
          sub="Estimate them from two photos — no tape measure needed"
          onClick={() => {}}
        />
      </Link>
      <MenuOption
        label="Need a design or color suggestion?"
        sub="Tell me the occasion or fabric you have in mind"
        onClick={() => onSelect("design")}
      />
      <MenuOption
        label="Have a complaint?"
        sub="We'll get the right person on it"
        onClick={() => onSelect("complaint")}
      />
      <MenuOption
        label="Want to speak with a human?"
        sub="Skip the AI, contact the tailor directly"
        onClick={() => onSelect("handoff")}
      />
    </div>
  );
}

function DesignView() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setReply(data.reply);
    } catch {
      setError("Couldn't reach Aria right now — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g. 'Wedding guest outfit, I like earth tones'"
          rows={3}
          className="bg-paper-raised rounded-2xl px-4 py-3 text-sm outline-none placeholder:text-muted resize-none"
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="bg-ink text-paper rounded-full py-3 text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Thinking…" : "Ask Aria"}
        </button>
      </form>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {reply && <p className="text-sm bg-paper-raised rounded-2xl px-4 py-3">{reply}</p>}
    </div>
  );
}

function ContactForm({
  source,
  placeholder,
  onSent,
}: {
  source: "ai_complaint" | "ai_handoff";
  placeholder: string;
  onSent: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
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
        body: JSON.stringify({ name, email, message, source }),
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
