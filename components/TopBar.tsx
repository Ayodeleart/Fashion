"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import AriaIcon from "@/components/AriaIcon";

export default function TopBar() {
  const { count } = useCart();

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3">
      <Link
        href="/search"
        aria-label="Search"
        className="w-10 h-10 rounded-full bg-paper-raised flex items-center justify-center shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink">
          <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={1.6} />
          <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      </Link>

      <div className="flex items-center gap-3">
        {/* AI button — unchanged, same AriaIcon used everywhere else Aria is entered */}
        <Link href="/aria" aria-label="Ask Aria" className="w-10 h-10 rounded-full overflow-hidden shrink-0">
          <AriaIcon className="w-full h-full" />
        </Link>

        <Link
          href="/cart"
          aria-label={`Cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
          className="relative w-10 h-10 rounded-full bg-paper-raised flex items-center justify-center shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 8.5h11l1 12.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5L6.5 8.5Z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <path d="M9 8.5V6.8a3 3 0 0 1 6 0V8.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-brass text-ink text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
