"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import PromoBannerPopup from "@/components/PromoBannerPopup";
import BottomNav from "@/components/BottomNav";
import InstallGate from "@/components/InstallGate";
import { isStandalone } from "@/lib/pwa-standalone";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

// Two tiers within the shop:
// - RESPONSIVE_PREFIXES: real desktop layouts exist (catalog, cart,
//   checkout, login/signup) — these render normally at any width, no
//   InstallGate, no "mobile only" block. Mobile behavior for these is
//   completely unchanged; they just ALSO now work on desktop.
// - MOBILE_ONLY_PREFIXES: unchanged from before — install-gated,
//   phone-only (reels, saved, search, the rest of /account).
const RESPONSIVE_PREFIXES = ["/catalog", "/cart", "/checkout", "/account/login", "/account/signup", "/product", "/look"];
const MOBILE_ONLY_PREFIXES = ["/saved", "/account", "/search", "/reels", "/auth", "/aria"];
const SHOP_PREFIXES = [...RESPONSIVE_PREFIXES, ...MOBILE_ONLY_PREFIXES];

// "/" is two different pages depending on who's asking (see
// HomeOrLandingGate + app/page.tsx): a plain browser tab gets the
// marketing landing page — no app chrome at all, same as any other
// website. Only once it's actually installed (standalone display mode)
// does "/" become the real app's Home tab and get the bottom nav +
// providers. This must match HomeOrLandingGate's own check exactly, or
// the chrome and the content disagree with each other.
function isHomePath(pathname: string) {
  return pathname === "/";
}

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const match = document.cookie.match(new RegExp(`${THEME_COOKIE_NAME}=(dark|light)`));
  return match?.[1] === "dark" ? "dark" : "light";
}

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHome = isHomePath(pathname);
  const isImmersive = pathname.startsWith("/reels/") || pathname === "/aria";
  const hasFloatingBottomBar = pathname.startsWith("/product");
  const [theme, setTheme] = useState<Theme>("light");
  const [installed, setInstalled] = useState(false);
  const [installChecked, setInstallChecked] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(readTheme());
    function handleThemeChange(e: Event) {
      setTheme((e as CustomEvent<Theme>).detail);
    }
    window.addEventListener("theme-change", handleThemeChange);
    return () => window.removeEventListener("theme-change", handleThemeChange);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
    setInstallChecked(true);
  }, []);

  // Only "/" needs to wait on this — every other route's chrome doesn't
  // depend on install status, so don't delay them.
  if (isHome && !installChecked) return null;

  const homeGetsAppShell = isHome && installed;
  const isShop = homeGetsAppShell || SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isResponsive = homeGetsAppShell || RESPONSIVE_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isShop) return <>{children}</>;

  if (isResponsive) {
    return (
      <div data-theme={theme} suppressHydrationWarning>
        <CartProvider>
          <SavedProvider>
            <QuickAddProvider>
              {/* Bottom nav + its reserved padding is a phone-app pattern —
                  desktop gets normal page flow, no InstallGate either
                  (product/product pages, mobile-only /product excluded
                  deliberately — see note below). */}
              <div
                className={`w-full min-h-screen bg-paper ${hasFloatingBottomBar ? "" : "pb-28"} md:pb-0`}
                style={{ paddingTop: "env(safe-area-inset-top)" }}
              >
                {children}
              </div>
              <div className="md:hidden">
                {!hasFloatingBottomBar && <BottomNav />}
              </div>
            </QuickAddProvider>
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
              <QuickAddProvider>
                <div
                  className={`w-full min-h-screen ${isImmersive ? "" : "pb-28"}`}
                  style={{ paddingTop: isImmersive ? undefined : "env(safe-area-inset-top)" }}
                >
                  {children}
                </div>
                {!isImmersive && <BottomNav />}
                {!isImmersive && <PromoBannerPopup />}
              </QuickAddProvider>
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
