"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import AriaIcon from "@/components/AriaIcon";

export default function SearchBar() {
  const router = useRouter();
  const [value, setValue] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    router.push(value.trim() ? `/search?q=${encodeURIComponent(value.trim())}` : "/search");
  }

  return (
    <div className="flex items-center gap-2.5 px-5 pb-5">
      <form onSubmit={handleSubmit} className="flex-1 min-w-0">
        <div className="flex items-center gap-3 bg-paper-raised rounded-full px-4 py-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.6} />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
          </svg>
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
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
  );
}
