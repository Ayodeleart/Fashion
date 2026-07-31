"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

const ROTATE_MS = 4200;
const DISMISS_KEY = "home-announcement-dismissed";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true); // start hidden, avoid flash before sessionStorage check
  const [index, setIndex] = useState(0);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    // Reading external storage (sessionStorage) on mount to sync the
    // initial dismissed state — not something a lazy useState initializer
    // can safely do here without risking a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");

    getSupabase()
      .from("ariana_announcements")
      .select("message")
      .eq("enabled", true)
      .order("position", { ascending: true })
      .then(({ data }) => {
        setMessages((data ?? []).map((row) => row.message));
      });
  }, []);

  useEffect(() => {
    if (dismissed || messages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [dismissed, messages.length]);

  if (dismissed || messages.length === 0) return null;

  return (
    <div className="relative h-[34px] bg-ink text-paper overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center px-8">
        {messages.map((message, i) => (
          <span
            key={message}
            className="absolute inset-0 flex items-center justify-center text-[11px] tracking-[0.08em] uppercase font-body transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{
              opacity: i === index ? 1 : 0,
              transform: i === index ? "translateY(0)" : "translateY(6px)",
            }}
            aria-hidden={i !== index}
          >
            {message}
          </span>
        ))}
      </div>

      <button
        type="button"
        aria-label="Dismiss announcement"
        onClick={() => {
          sessionStorage.setItem(DISMISS_KEY, "1");
          setDismissed(true);
        }}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-paper/70 hover:text-paper transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
