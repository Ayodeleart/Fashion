"use client";

export const dynamic = "force-dynamic";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AriaIcon from "@/components/AriaIcon";
import AriaMeasureCard from "@/components/aria/AriaMeasureCard";
import AriaDesignCard from "@/components/aria/AriaDesignCard";
import AriaAppointmentCard from "@/components/aria/AriaAppointmentCard";
import AriaLiveTalkCard from "@/components/aria/AriaLiveTalkCard";
import ConciergeContactForm from "@/components/ConciergeContactForm";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Panel = "chat" | "appointment" | "handoff";

function BackIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AriaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [panel, setPanel] = useState<Panel>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Deep-linking from the search bar's suggestion chips — either jump
  // straight to a panel (?panel=appointment) or land in chat with a
  // prompt ready to send (?prompt=...), sent automatically since the
  // person already chose that exact suggestion, not typed it themselves.
  useEffect(() => {
    const panelParam = searchParams.get("panel");
    if (panelParam === "appointment" || panelParam === "handoff") {
      setPanel(panelParam);
      return;
    }
    const prompt = searchParams.get("prompt");
    if (prompt) sendMessage(prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text.trim() }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text.trim(), history: messages }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessages([...nextMessages, { role: "assistant", content: data.reply }]);
      }
    } catch {
      setError("Couldn't reach Aria right now — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col">
      <header className="flex items-center gap-3 px-4 pt-6 pb-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="w-9 h-9 rounded-full bg-paper-raised flex items-center justify-center text-ink shrink-0"
        >
          <BackIcon />
        </button>
        <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
          <AriaIcon className="w-full h-full" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-tight">Aria</p>
          <p className="text-[11px] text-muted leading-tight">Personal Tailoring Assistant</p>
        </div>
      </header>

      {panel === "chat" && (
        <>
          {/* Services — horizontal scroll of colorful illustrated cards,
              matching the reference layout (not a grid). */}
          <div className="flex gap-3 px-4 pb-4 overflow-x-auto no-scrollbar">
            <Link href="/account/measurements" className="w-32 h-36 shrink-0">
              <AriaMeasureCard />
            </Link>
            <button onClick={() => document.getElementById("aria-chat-input")?.focus()} className="w-32 h-36 shrink-0">
              <AriaDesignCard />
            </button>
            <button onClick={() => setPanel("appointment")} className="w-32 h-36 shrink-0">
              <AriaAppointmentCard />
            </button>
            <button onClick={() => setPanel("handoff")} className="w-32 h-36 shrink-0">
              <AriaLiveTalkCard />
            </button>
          </div>

          {/* Chat thread */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pb-3 flex flex-col gap-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted text-center mt-8">
                Ask me about fabrics, colors, or an occasion — I'll suggest something from our
                actual collection.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                  m.role === "user" ? "self-end bg-ink text-paper" : "self-start bg-paper-raised text-ink"
                }`}
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="self-start bg-paper-raised text-muted rounded-2xl px-4 py-3 text-sm">
                Thinking…
              </div>
            )}
            {error && <p className="text-xs text-red-600 text-center">{error}</p>}
          </div>

          {/* Persistent input bar — always visible, this is the actual
              chat field. */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex items-center gap-2 px-4 py-3 border-t border-ink/10"
          >
            <input
              id="aria-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Aria..."
              className="flex-1 min-w-0 bg-paper-raised rounded-full px-4 py-3 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send"
              className="w-11 h-11 rounded-full bg-ink text-paper flex items-center justify-center shrink-0 disabled:opacity-50"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l16-7-6 16-2.5-6.5L4 12z" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </>
      )}

      {panel !== "chat" && (
        <div className="px-4 pt-2 pb-8">
          <button onClick={() => setPanel("chat")} className="text-xs text-muted mb-4">
            ← Back to chat
          </button>
          <h2 className="text-base font-semibold mb-1">
            {panel === "appointment" ? "Book a fitting" : "Talk to a human"}
          </h2>
          <p className="text-xs text-muted mb-4">
            {panel === "appointment"
              ? "Tell me your preferred dates and what you need fitted — we'll confirm a slot."
              : "Skip the AI, contact the tailor directly."}
          </p>
          <ConciergeContactForm
            source="ai_handoff"
            onSent={() => setPanel("chat")}
            placeholder={
              panel === "appointment"
                ? "e.g. 'Available weekday afternoons, need an agbada fitted for late August'"
                : "What would you like to talk to us about? We'll reach out."
            }
          />
        </div>
      )}
    </div>
  );
}
