"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" />
    </svg>
  );
}
function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 20s-7.5-4.6-9.6-9.2C1.2 7.6 3 4.5 6.3 4.1c2-.2 3.7.9 5.7 3 2-2.1 3.7-3.2 5.7-3 3.3.4 5.1 3.5 3.9 6.7C19.5 15.4 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth={active ? 2.2 : 1.6}
        strokeLinejoin="round"
      />
    </svg>
  );
}
function ProfileIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="3.6" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} />
      <path d="M4.5 20c1.4-3.6 4.4-5.5 7.5-5.5s6.1 1.9 7.5 5.5" stroke="currentColor" strokeWidth={active ? 2.2 : 1.6} strokeLinecap="round" />
    </svg>
  );
}
function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M7 8V6a5 5 0 0 1 10 0v2" stroke="white" strokeWidth={1.8} strokeLinecap="round" />
      <rect x="4" y="8" width="16" height="12" rx="2" fill="white" />
      <rect x="4" y="8" width="16" height="12" rx="2" stroke="white" strokeWidth={1.6} />
    </svg>
  );
}

const items = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/search", label: "Search", Icon: SearchIcon },
];
const rightItems = [
  { href: "/saved", label: "Saved", Icon: HeartIcon },
  { href: "/account/profile", label: "Profile", Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-paper/95 backdrop-blur border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto flex items-center justify-between px-6 py-2 relative">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-1 px-2 text-ink">
              <Icon active={active} />
              <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
            </Link>
          );
        })}

        <Link
          href="/cart"
          className="relative -mt-6 w-14 h-14 rounded-full bg-ink flex items-center justify-center shadow-lg shrink-0"
          aria-label="Cart"
        >
          <BagIcon />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-brass text-ink text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>

        {rightItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className="flex flex-col items-center gap-1 py-1 px-2 text-ink">
              <Icon active={active} />
              <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
