"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import PromoBannerPopup from "@/components/PromoBannerPopup";
import BottomNav from "@/components/BottomNav";
import InstallGate from "@/components/InstallGate";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

// Two tiers within the shop:
// - RESPONSIVE_PREFIXES: real desktop layouts exist (catalog, cart,
//   checkout, login/signup) — these render normally at any width, no
//   InstallGate, no "mobile only" block. Mobile behavior for these is
//   completely unchanged; they just ALSO now work on desktop.
// - MOBILE_ONLY_PREFIXES: unchanged from before — install-gated,
//   phone-only (reels, saved, search, the rest of /account).
const RESPONSIVE_PREFIXES = ["/catalog", "/cart", "/checkout", "/account/login", "/account/signup", "/product"];
const MOBILE_ONLY_PREFIXES = ["/saved", "/account", "/search", "/reels", "/auth", "/aria"];
const SHOP_PREFIXES = [...RESPONSIVE_PREFIXES, ...MOBILE_ONLY_PREFIXES];

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const match = document.cookie.match(new RegExp(`${THEME_COOKIE_NAME}=(dark|light)`));
  return match?.[1] === "dark" ? "dark" : "light";
}

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isResponsive = RESPONSIVE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isImmersive = pathname.startsWith("/reels/") || pathname === "/aria";
  const hasFloatingBottomBar = pathname.startsWith("/product");
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(readTheme());
    function handleThemeChange(e: Event) {
      setTheme((e as CustomEvent<Theme>).detail);
    }
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  if (!isShop) return <>{children}</>;

  if (isResponsive) {
    return (
      <div data-theme={theme} suppressHydrationWarning>
        <CartProvider>
          <SavedProvider>
            {/* Bottom nav + its reserved padding is a phone-app pattern —
                desktop gets normal page flow, no InstallGate either
                (product/product pages, mobile-only /product excluded
                deliberately — see note below). */}
            <div className={`w-full min-h-screen bg-paper ${hasFloatingBottomBar ? "" : "pb-28"} md:pb-0`}>{children}</div>
            <div className="md:hidden">
              {!hasFloatingBottomBar && <BottomNav />}
            </div>
          </SavedProvider>
        </CartProvider>
      </div>
    );
  }

  return (
    <div data-theme={theme} suppressHydrationWarning>
      <InstallGate>
        <div className="md:hidden w-full min-h-screen bg-paper">
          <CartProvider>
            <SavedProvider>
              <div className={`w-full min-h-screen ${isImmersive ? "" : "pb-28"}`}>{children}</div>
              {!isImmersive && <BottomNav />}
              {!isImmersive && <PromoBannerPopup />}
            </SavedProvider>
          </CartProvider>
        </div>

        {/* Reels/saved/search/account (besides login+signup) remain
            mobile-only — app-style surfaces without a desktop design yet. */}
        <div className="hidden md:flex min-h-screen items-center justify-center px-6 text-center bg-paper">
          <div className="max-w-sm">
            <h1 className="font-display text-2xl mb-2">This is a mobile experience</h1>
            <p className="text-sm text-muted">Please use this app on your phone.</p>
          </div>
        </div>
      </InstallGate>
    </div>
  );
}
