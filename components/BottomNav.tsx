"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path
        d="M22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
      />
      <path d="M15 18H9" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  );
}
function ReelsIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="3.5 3.5 17 17" fill="none">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 9V15C19 17.2091 17.2091 19 15 19H9C6.79086 19 5 17.2091 5 15V9C5 6.79086 6.79086 5 9 5H15C17.2091 5 19 6.79086 19 9Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.4 12.117L13.3 13.549C13.4244 13.6373 13.4983 13.7804 13.4983 13.933C13.4983 14.0855 13.4244 14.2286 13.3 14.317L11.4 15.883C11.2396 16.0081 11.0239 16.0363 10.8367 15.9564C10.6496 15.8766 10.5206 15.7014 10.5 15.499V12.499C10.5213 12.2969 10.6505 12.1223 10.8375 12.043C11.0245 11.9636 11.2399 11.9919 11.4 12.117V12.117Z"
        stroke="currentColor"
        strokeWidth={active ? 2 : 1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M19 9.75C19.4142 9.75 19.75 9.41421 19.75 9C19.75 8.58579 19.4142 8.25 19 8.25V9.75ZM12 8.25C11.5858 8.25 11.25 8.58579 11.25 9C11.25 9.41421 11.5858 9.75 12 9.75V8.25ZM5 8.25C4.58579 8.25 4.25 8.58579 4.25 9C4.25 9.41421 4.58579 9.75 5 9.75V8.25ZM12 9.75C12.4142 9.75 12.75 9.41421 12.75 9C12.75 8.58579 12.4142 8.25 12 8.25V9.75ZM11.25 9C11.25 9.41421 11.5858 9.75 12 9.75C12.4142 9.75 12.75 9.41421 12.75 9H11.25ZM12.75 5C12.75 4.58579 12.4142 4.25 12 4.25C11.5858 4.25 11.25 4.58579 11.25 5H12.75ZM19 8.25H12V9.75H19V8.25ZM5 9.75H12V8.25H5V9.75ZM12.75 9V5H11.25V9H12.75Z"
        fill="currentColor"
      />
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
function ShopIcon() {
  // The original center-button SVG, unchanged. Only the label, href, and
  // badge logic around it changed (it now reads Shop / -> /catalog, no
  // cart-count badge, since count moved to the top bar) — the artwork
  // itself was restored exactly as it shipped, at the person's request.
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <g transform="translate(-164, -2959)">
        <path d="M180.846448,2977 L167.153448,2977 C166.544448,2977 166.077448,2976.461 166.163448,2975.859 L167.306448,2967.859 C167.376448,2967.366 167.798448,2967 168.296448,2967 L168.999448,2967 L168.999448,2969 C168.999448,2969.552 169.447448,2970 169.999448,2970 C170.552448,2970 170.999448,2969.552 170.999448,2969 L170.999448,2967 L176.999448,2967 L176.999448,2969 C176.999448,2969.552 177.447448,2970 177.999448,2970 C178.552448,2970 178.999448,2969.552 178.999448,2969 L178.999448,2967 L179.703448,2967 C180.201448,2967 180.623448,2967.366 180.693448,2967.859 L181.836448,2975.859 C181.922448,2976.461 181.455448,2977 180.846448,2977 L180.846448,2977 Z M170.999448,2964 C170.999448,2962.346 172.345448,2961 173.999448,2961 C175.654448,2961 176.999448,2962 176.999448,2964 L176.999448,2965 L170.999448,2965 L170.999448,2964 Z M183.979448,2976.717 L182.550448,2966.717 C182.410448,2965.732 181.566448,2965 180.570448,2965 L178.999448,2965 L178.999448,2964 C178.999448,2961 176.756448,2959 173.999448,2959 C171.243448,2959 168.999448,2961.243 168.999448,2964 L168.999448,2965 L167.734448,2965 C166.739448,2965 165.589448,2965.732 165.448448,2966.717 L164.020448,2976.717 C163.848448,2977.922 164.783448,2979 166.000448,2979 L181.999448,2979 C183.216448,2979 184.151448,2977.922 183.979448,2976.717 L183.979448,2976.717 Z" />
      </g>
    </svg>
  );
}

const leftItems = [
  // Home is the editorial style book — not the shop.
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/reels", label: "Reels", Icon: ReelsIcon },
];
const rightItems = [
  { href: "/saved", label: "Saved", Icon: HeartIcon },
  { href: "/account/profile", label: "Profile", Icon: ProfileIcon },
];

export default function BottomNav() {
  const pathname = usePathname();

  const allItems = [...leftItems, ...rightItems];
  const itemRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);

  // Measures the active tab's actual position via the DOM (not computed
  // from fixed offsets) since the flex row uses justify-between with
  // variable gaps depending on viewport width — a hardcoded index-based
  // position would drift. Re-measures on route change and on resize.
  useLayoutEffect(() => {
    function measure() {
      const active = allItems.find((item) => item.href === pathname);
      const el = active ? itemRefs.current[active.href] : null;
      const container = containerRef.current;
      if (!el || !container) {
        setPill(null);
        return;
      }
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setPill({ left: elRect.left - containerRect.left, width: elRect.width });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    // Deliberately simple: a flat bar, and the Shop button is just the
    // LAST element in the DOM so it paints on top of the bar and floats
    // above it via a negative top offset. No cutout/notch shape — that
    // was causing the bar's own fill to visually intrude on the button.
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-paper border-t border-ink/10 pb-[env(safe-area-inset-bottom)]">
      <div ref={containerRef} className="max-w-md mx-auto relative flex items-center justify-between px-6 h-16">
        {/* Liquid indicator — a soft pill that slides + slightly stretches
            to the active tab. Never rendered behind the middle Shop
            button (that one isn't in allItems, so pill is null there
            momentarily, but /catalog is a separate route so this nav's
            own active-state highlighting doesn't apply to it anyway). A
            bouncy easing curve gives the "liquid" overshoot feel; token
            colors (brass/ink at low opacity) keep it visible in both themes. */}
        {pill && (
          <span
            aria-hidden
            className="absolute top-1/2 h-11 rounded-full bg-brass/15 pointer-events-none"
            style={{
              left: pill.left - 6,
              width: pill.width + 12,
              transform: "translateY(-50%)",
              transition: "left 450ms cubic-bezier(0.34, 1.56, 0.64, 1), width 450ms cubic-bezier(0.34, 1.56, 0.64, 1)",
            }}
          />
        )}

        {leftItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              ref={(el) => {
                itemRefs.current[href] = el;
              }}
              className="relative flex flex-col items-center justify-center gap-1 text-ink w-12 z-10"
            >
              <Icon active={active} />
              <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
            </Link>
          );
        })}

        <div className="w-14 shrink-0" />

        {rightItems.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              ref={(el) => {
                itemRefs.current[href] = el;
              }}
              className="relative flex flex-col items-center justify-center gap-1 text-ink w-12 z-10"
            >
              <Icon active={active} />
              <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
            </Link>
          );
        })}

        <Link
          href="/catalog"
          className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 rounded-full bg-ink text-paper flex flex-col items-center justify-center shadow-lg z-10 gap-0.5"
          aria-label="Shop"
        >
          <ShopIcon />
          <span className="text-[9px] leading-none">Shop</span>
        </Link>
      </div>
    </nav>
  );
}
