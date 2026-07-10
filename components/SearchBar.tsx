"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import AriaIcon from "@/components/AriaIcon";

const SUGGESTIONS = [
  { label: "Get your measurements — no tape measure", href: "/account/measurements" },
  { label: "Ask for a design or color match", href: "/aria?prompt=" + encodeURIComponent("Suggest a design and color for me") },
  { label: "Book a fitting appointment", href: "/aria?panel=appointment" },
  { label: "Talk to a real person", href: "/aria?panel=handoff" },
];

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
  }

  const showSuggestions = focused && value.trim() === "";

  return (
    <div className="relative px-5 pb-5">
      <div className="flex items-center gap-2.5">
        <form onSubmit={handleSubmit} className="flex-1 min-w-0">
          <div className="flex items-center gap-3 bg-paper-raised rounded-full px-4 py-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
              <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.6} />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
            </svg>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Search..."
              className="flex-1 min-w-0 bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <button type="submit" aria-label="Voice search" className="text-muted shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <rect x="9" y="3" width="6" height="11" rx="3" stroke="currentColor" strokeWidth={1.6} />
                <path d="M5 11a7 7 0 0 0 14 0M12 18v3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </form>

        <Link href="/aria" aria-label="Ask Aria" className="w-11 h-11 rounded-full overflow-hidden shrink-0">
          <AriaIcon className="w-full h-full" />
        </Link>
      </div>

      {showSuggestions && (
        <div className="absolute left-5 right-16 top-full mt-1 bg-paper-raised rounded-2xl overflow-hidden shadow-lg z-30">
          <p className="text-[11px] text-muted px-4 pt-3 pb-1">Ask Aria</p>
          {SUGGESTIONS.map((s) => (
            <Link
              key={s.label}
              href={s.href}
              className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-ink/5 transition-colors"
            >
              <AriaIcon className="w-4 h-4 shrink-0" />
              <span>{s.label}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
