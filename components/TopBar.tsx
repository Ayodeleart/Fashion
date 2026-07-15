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
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-ink">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.57386 4.69147C4.74068 5.38295 4.52122 6.55339 4.08231 8.89427L3.33231 12.8943C2.71512 16.186 2.40652 17.8318 3.30624 18.9159C4.20595 20 5.88048 20 9.22954 20H14.7704C18.1195 20 19.794 20 20.6937 18.9159C21.5934 17.8318 21.2849 16.186 20.6677 12.8943L19.9177 8.89427C19.4787 6.55339 19.2593 5.38295 18.4261 4.69147C17.5929 4 16.4021 4 14.0204 4H9.97954C7.59787 4 6.40703 4 5.57386 4.69147ZM9.87822 7.75007C10.1875 8.62497 11.0219 9.25 12.0004 9.25C12.9789 9.25 13.8133 8.62497 14.1225 7.75007C14.2606 7.35953 14.6891 7.15483 15.0796 7.29287C15.4701 7.43091 15.6748 7.8594 15.5368 8.24993C15.0224 9.70541 13.6343 10.75 12.0004 10.75C10.3664 10.75 8.97839 9.70541 8.46396 8.24993C8.32592 7.8594 8.53061 7.43091 8.92115 7.29287C9.31169 7.15483 9.74018 7.35953 9.87822 7.75007Z"
              fill="currentColor"
            />
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
