"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/CartProvider";

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
function CartIcon() {
  // Exact path data from the provided shopping-cart SVG (originally nested
  // in two <g transform="translate(...)"> — combined here into one, so the
  // coordinates map directly onto this 0 0 20 20 viewBox), recolored white.
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
      <g transform="translate(-164, -2959)">
        <path d="M180.846448,2977 L167.153448,2977 C166.544448,2977 166.077448,2976.461 166.163448,2975.859 L167.306448,2967.859 C167.376448,2967.366 167.798448,2967 168.296448,2967 L168.999448,2967 L168.999448,2969 C168.999448,2969.552 169.447448,2970 169.999448,2970 C170.552448,2970 170.999448,2969.552 170.999448,2969 L170.999448,2967 L176.999448,2967 L176.999448,2969 C176.999448,2969.552 177.447448,2970 177.999448,2970 C178.552448,2970 178.999448,2969.552 178.999448,2969 L178.999448,2967 L179.703448,2967 C180.201448,2967 180.623448,2967.366 180.693448,2967.859 L181.836448,2975.859 C181.922448,2976.461 181.455448,2977 180.846448,2977 L180.846448,2977 Z M170.999448,2964 C170.999448,2962.346 172.345448,2961 173.999448,2961 C175.654448,2961 176.999448,2962 176.999448,2964 L176.999448,2965 L170.999448,2965 L170.999448,2964 Z M183.979448,2976.717 L182.550448,2966.717 C182.410448,2965.732 181.566448,2965 180.570448,2965 L178.999448,2965 L178.999448,2964 C178.999448,2961 176.756448,2959 173.999448,2959 C171.243448,2959 168.999448,2961.243 168.999448,2964 L168.999448,2965 L167.734448,2965 C166.739448,2965 165.589448,2965.732 165.448448,2966.717 L164.020448,2976.717 C163.848448,2977.922 164.783448,2979 166.000448,2979 L181.999448,2979 C183.216448,2979 184.151448,2977.922 183.979448,2976.717 L183.979448,2976.717 Z" />
      </g>
    </svg>
  );
}

const leftItems = [
  { href: "/catalog", label: "Home", Icon: HomeIcon },
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
    <div className="fixed bottom-0 left-0 right-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto relative h-[74px]">
        {/* The bar shape itself — drawn as one SVG path so the top edge
            genuinely curves down and wraps around the cart button,
            instead of a flat bar with a circle floating on top of it.
            preserveAspectRatio="none" stretches it to the container's
            actual width; the notch curve is defined in percent-based
            viewBox units (0-100) so it stays centered regardless of
            width. */}
        <svg
          viewBox="0 0 100 34"
          preserveAspectRatio="none"
          className="absolute inset-0 w-full h-full drop-shadow-[0_-2px_10px_rgba(0,0,0,0.08)]"
        >
          <path
            d="M0,6
               C0,2.7 2.7,0 6,0
               H36
               C41,0 40,11 50,11
               C60,11 59,0 64,0
               H94
               C97.3,0 100,2.7 100,6
               V34 H0 Z"
            className="fill-paper"
          />
        </svg>

        <div className="relative h-full flex items-center justify-between px-6">
          {leftItems.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 text-ink w-12">
                <Icon active={active} />
                <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
              </Link>
            );
          })}

          {/* Spacer so the two side groups don't creep under the notch */}
          <div className="w-14 shrink-0" />

          {rightItems.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} className="flex flex-col items-center justify-center gap-1 text-ink w-12">
                <Icon active={active} />
                <span className={`text-[11px] ${active ? "text-ink" : "text-muted"}`}>{label}</span>
              </Link>
            );
          })}
        </div>

        <Link
          href="/cart"
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-ink flex items-center justify-center shadow-lg"
          aria-label="Cart"
        >
          <CartIcon />
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
