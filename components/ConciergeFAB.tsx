"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AriaIcon from "@/components/AriaIcon";

const TOOLTIP_SEEN_KEY = "concierge-fab-tooltip-seen";

function MeasureIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 16.5v-9A1.5 1.5 0 0 1 5.5 6h13A1.5 1.5 0 0 1 20 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5Z"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <path d="M7 6v3M10 6v2M13 6v3M16 6v2" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function TryOnIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 4.5 12 3l3 1.5 3.5 1.4a1 1 0 0 1 .6 1.3L18 10h-2.5v9a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-9H6L4.9 6.2a1 1 0 0 1 .6-1.3L9 4.5Z"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AppointmentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <rect x="4" y="5.5" width="16" height="14.5" rx="2" stroke="currentColor" strokeWidth={1.6} />
      <path d="M4 9.5h16M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="9" cy="13.3" r="1.1" fill="currentColor" />
      <circle cx="12.5" cy="13.3" r="1.1" fill="currentColor" />
    </svg>
  );
}

function HumanIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth={1.6} />
      <path d="M5 20c0-3.6 3.13-6 7-6s7 2.4 7 6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

const ACTIONS = [
  { href: "/account/measurements", label: "Measure Me", Icon: MeasureIcon },
  { href: "/try-on", label: "Try On", Icon: TryOnIcon },
  { href: "/appointment", label: "Book Appointment", Icon: AppointmentIcon },
  { href: "/account/contact", label: "Talk to Human", Icon: HumanIcon },
];

// Shown on Home, Shop, Lookbook, and Product surfaces — kept as an
// allowlist of prefixes rather than a blocklist so new routes default to
// NOT showing the FAB unless explicitly added here.
const VISIBLE_PREFIXES = ["/", "/catalog", "/look", "/product", "/try-on"];

export function shouldShowConciergeFAB(pathname: string) {
  if (pathname === "/") return true;
  return VISIBLE_PREFIXES.some((prefix) => prefix !== "/" && pathname.startsWith(prefix));
}

export default function ConciergeFAB({ bottomOffsetClass }: { bottomOffsetClass: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(TOOLTIP_SEEN_KEY)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowTooltip(true);
      }
    } catch {
      // localStorage unavailable — skip the tooltip rather than throw.
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  function dismissTooltip() {
    setShowTooltip(false);
    try {
      window.localStorage.setItem(TOOLTIP_SEEN_KEY, "1");
    } catch {
      // Non-fatal — tooltip just reappears next session.
    }
  }

  function handleToggle() {
    if (showTooltip) dismissTooltip();
    setOpen((v) => !v);
  }

  if (!shouldShowConciergeFAB(pathname)) return null;

  return (
    <div ref={rootRef} className={`fixed right-4 md:right-8 z-40 flex flex-col items-end gap-3 ${bottomOffsetClass}`}>
      {showTooltip && !open && (
        <div className="mr-1 mb-1 px-3 py-1.5 rounded-full bg-ink text-paper text-xs whitespace-nowrap shadow-lg animate-[fadeIn_0.3s_ease]">
          Your AI Concierge
        </div>
      )}

      {open && (
        <div className="flex flex-col items-end gap-2.5 mb-1">
          {ACTIONS.map(({ href, label, Icon }, i) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 pl-4 pr-2.5 py-2.5 rounded-full bg-paper text-ink shadow-[0_8px_24px_rgba(0,0,0,0.18)] border border-ink/10 hover:border-brass/50 transition-colors"
              style={{ animation: `fabItemIn 220ms ease ${i * 35}ms both` }}
            >
              <span className="text-sm font-medium whitespace-nowrap">{label}</span>
              <span className="w-8 h-8 rounded-full bg-paper-raised flex items-center justify-center shrink-0">
                <Icon />
              </span>
            </Link>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={handleToggle}
        aria-label={open ? "Close AI Concierge" : "Open AI Concierge"}
        aria-expanded={open}
        className={`w-14 h-14 rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.28)] flex items-center justify-center overflow-hidden transition-transform duration-300 ${
          open ? "rotate-45" : "rotate-0"
        }`}
      >
        {open ? (
          <span className="w-full h-full bg-ink flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </span>
        ) : (
          <AriaIcon className="w-full h-full" />
        )}
      </button>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fabItemIn { from { opacity: 0; transform: translateY(6px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
    </div>
  );
}
