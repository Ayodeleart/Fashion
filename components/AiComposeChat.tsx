"use client";

import { useState, useRef, useEffect } from "react";

type ChatMessage = { role: "user" | "assistant"; content: string };

export default function AiComposeChat({
  mode,
  context,
  onUseDraft,
}: {
  mode: "appointment" | "enquiry";
  context?: string;
  onUseDraft: (text: string) => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        mode === "appointment"
          ? "Hi! Tell me a bit about what you'd like to book — a fitting, a bespoke order, an alteration, whatever it is — and I'll help you put it into a clear message for the team."
          : "Hi! What would you like to ask us? Tell me a bit about it and I'll help you write it up clearly.",
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestDraft, setLatestDraft] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setError(null);
    setInput("");
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setSending(true);

    try {
      const res = await fetch("/api/ai/compose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: nextMessages, mode, context }),
      });
      const data: { reply?: string; draft?: string | null; error?: string } = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply ?? "" }]);
      if (data.draft) setLatestDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong — try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="border border-ink/10 rounded-2xl bg-paper-raised flex flex-col h-full min-h-[360px] md:min-h-[440px]">
      <div className="px-4 py-3 border-b border-ink/10 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-ink text-paper flex items-center justify-center text-[11px] font-display shrink-0">AI</span>
        <p className="text-sm font-medium">Write it with AI</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user" ? "bg-ink text-paper" : "bg-paper border border-ink/10 text-ink"
              }`}
            >
              {m.content.replace(/DRAFT:\s*[\s\S]+$/i, "").trim() || m.content}
            </div>
          </div>
        ))}
        {sending && <p className="text-xs text-muted px-1">Thinking…</p>}
        {error && <p className="text-xs text-red-600 px-1">{error}</p>}
      </div>

      {latestDraft && (
        <div className="px-4 pb-2">
          <div className="border border-ink/15 rounded-xl p-3 bg-paper">
            <p className="text-[11px] uppercase tracking-wide text-muted mb-1">Draft message</p>
            <p className="text-sm mb-2">{latestDraft}</p>
            <button
              type="button"
              onClick={() => onUseDraft(latestDraft)}
              className="text-xs font-medium bg-ink text-paper rounded-full px-3.5 py-1.5"
            >
              Use this message
            </button>
          </div>
        </div>
      )}

      <div className="px-3 pb-3 pt-1 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Type here…"
          disabled={sending}
          className="flex-1 bg-paper border border-ink/15 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-ink/40"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !input.trim()}
          aria-label="Send"
          className="shrink-0 w-10 h-10 rounded-full bg-ink text-paper flex items-center justify-center disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2 11 13" />
            <path d="M22 2 15 22l-4-9-9-4 20-7Z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
