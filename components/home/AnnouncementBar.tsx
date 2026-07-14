"use client";

import { useEffect, useState } from "react";

// Edit this list directly — no table for it, it's just copy.
const MESSAGES = [
  "New Luxury Collection Available",
  "AI Measurement Now Available",
  "Free Consultation For Bespoke Orders",
  "Wedding Season Collection",
  "New Celebrity Looks",
];

const ROTATE_MS = 4200;
const DISMISS_KEY = "home-announcement-dismissed";

export default function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(true); // start hidden, avoid flash before sessionStorage check
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Reading external storage (sessionStorage) on mount to sync the
    // initial dismissed state — not something a lazy useState initializer
    // can safely do here without risking a server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDismissed(sessionStorage.getItem(DISMISS_KEY) === "1");
  }, []);

  useEffect(() => {
    if (dismissed) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, ROTATE_MS);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (dismissed) return null;

  return (
    <div className="relative h-[34px] bg-ink text-paper overflow-hidden flex items-center justify-center">
      <div className="relative w-full h-full flex items-center justify-center px-8">
        {MESSAGES.map((message, i) => (
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
