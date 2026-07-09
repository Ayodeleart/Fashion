"use client";

import { useState } from "react";
import Link from "next/link";
import AriaIcon from "@/components/AriaIcon";
import ConciergeContactForm from "@/components/ConciergeContactForm";

type View = "menu" | "design" | "issue" | "handoff";

const TILES: { view: View | "measure"; label: string; sub: string; emoji: string }[] = [
  { view: "measure", label: "Measure", sub: "From one photo", emoji: "📏" },
  { view: "design", label: "Design", sub: "Style ideas", emoji: "🎨" },
  { view: "issue", label: "Report Issue", sub: "Fast support routing", emoji: "🛠️" },
  { view: "handoff", label: "Talk to Human", sub: "Live handoff", emoji: "👤" },
];

export default function AriaPage() {
  const [view, setView] = useState<View>("menu");

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      {/* No back button, no close (x), no bottom nav — this is a real
          route (not a modal), so the OS/browser back gesture is the
          exit, same as any other page in the app. */}
      <header className="px-6 pt-10 pb-6 text-center">
        <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-3">
          <AriaIcon className="w-full h-full" />
        </div>
        <h1 className="font-display text-2xl">
          {view === "menu" ? "Hi, I'm Aria" : TITLES_FOR(view)}
        </h1>
        <p className="text-xs text-muted mt-1">Personal Tailoring Assistant</p>
      </header>

      <div className="flex-1 px-5 pb-10 overflow-y-auto">
        {view === "menu" && (
          <div className="grid grid-cols-2 gap-3">
            {TILES.map((tile) =>
              tile.view === "measure" ? (
                <Link
                  key={tile.label}
                  href="/account/measurements"
                  className="bg-paper-raised rounded-2xl p-5 flex flex-col items-start gap-2"
                >
                  <span className="text-2xl">{tile.emoji}</span>
                  <span className="text-sm font-medium">{tile.label}</span>
                  <span className="text-xs text-muted">{tile.sub}</span>
                </Link>
              ) : (
                <button
                  key={tile.label}
                  onClick={() => setView(tile.view as View)}
                  className="bg-paper-raised rounded-2xl p-5 flex flex-col items-start gap-2 text-left"
                >
                  <span className="text-2xl">{tile.emoji}</span>
                  <span className="text-sm font-medium">{tile.label}</span>
                  <span className="text-xs text-muted">{tile.sub}</span>
                </button>
              )
            )}
          </div>
        )}

        {view !== "menu" && (
          <button onClick={() => setView("menu")} className="text-xs text-muted mb-4">
            ← All services
          </button>
        )}

        {view === "design" && <DesignView />}
        {view === "issue" && (
          <ConciergeContactForm
            source="ai_complaint"
            onSent={() => setView("menu")}
            placeholder="Tell me what happened — order number helps if you have it."
          />
        )}
        {view === "handoff" && (
          <ConciergeContactForm
            source="ai_handoff"
            onSent={() => setView("menu")}
            placeholder="What would you like to talk to us about? We'll reach out."
          />
        )}
      </div>
    </div>
  );
}

function TITLES_FOR(view: View) {
  if (view === "design") return "Design & color ideas";
  if (view === "issue") return "Report an issue";
  if (view === "handoff") return "Talk to a human";
  return "Hi, I'm Aria";
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
