"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import { QuickAddProvider } from "@/components/QuickAddProvider";
import PromoBannerPopup from "@/components/PromoBannerPopup";
import TopNav from "@/components/TopNav";
import InstallGate from "@/components/InstallGate";
import DesktopHeader from "@/components/DesktopHeader";
import DesktopFooter from "@/components/DesktopFooter";
import MobileInstallPrompt from "@/components/MobileInstallPrompt";
import { isStandalone } from "@/lib/pwa-standalone";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

// Two tiers within the shop:
// - RESPONSIVE_PREFIXES: real desktop layouts exist (catalog, cart,
//   checkout, login/signup, product, look). Desktop gets a genuine browser
//   storefront here — top nav + footer, no bottom nav/app-shell, no install
//   requirement at all. Mobile browsers get the same app-shell as before,
//   but ONLY once actually installed; an uninstalled phone browser sees an
//   install prompt instead of the shopping UI (see MobileInstallPrompt).
// - MOBILE_ONLY_PREFIXES: unchanged from before — install-gated,
//   phone-only (reels, saved, search, the rest of /account).
const RESPONSIVE_PREFIXES = ["/catalog", "/cart", "/checkout", "/account/login", "/account/signup", "/product", "/look", "/appointment", "/enquiry"];
const MOBILE_ONLY_PREFIXES = ["/saved", "/account", "/search", "/reels", "/auth", "/aria"];

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
  const isEcommerceRoute = RESPONSIVE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isShop = homeGetsAppShell || isEcommerceRoute || MOBILE_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isShop) return <>{children}</>;

  // Installed Home keeps its existing mobile app-shell exactly as it was —
  // untouched by the desktop storefront / install-gate logic below, since by
  // definition the app is already installed to reach this branch at all.
  if (homeGetsAppShell) {
    return (
      <div data-theme={theme} suppressHydrationWarning>
        <CartProvider>
          <SavedProvider>
            <QuickAddProvider>
              <div
                className="w-full min-h-screen bg-paper"
                style={{ paddingTop: "env(safe-area-inset-top)" }}
              >
                <div className="md:hidden">
                  <TopNav />
                </div>
                {children}
              </div>
              <div
                className="fixed top-0 left-0 right-0 z-30 bg-paper pointer-events-none"
                style={{ height: "env(safe-area-inset-top)" }}
                aria-hidden="true"
              />
            </QuickAddProvider>
          </SavedProvider>
        </CartProvider>
      </div>
    );
  }

  if (isEcommerceRoute) {
    return (
      <div data-theme={theme} suppressHydrationWarning>
        <CartProvider>
          <SavedProvider>
            <QuickAddProvider>
              {/* Desktop: a real storefront — top nav + footer, no install
                  requirement, no bottom nav/app-shell at all. */}
              <div className="hidden md:flex md:flex-col md:min-h-screen">
                <DesktopHeader />
                <div className="flex-1">{children}</div>
                <DesktopFooter />
              </div>

              {/* Mobile browser: same app-shell as before, but only once
                  actually installed — otherwise an install prompt instead of
                  the shopping UI, so mobile web visitors get funneled into
                  installing rather than browsing uninstalled. */}
              <div className="md:hidden">
                {!installChecked ? null : installed ? (
                  <>
                    <div
                      className="w-full min-h-screen bg-paper"
                      style={{ paddingTop: "env(safe-area-inset-top)" }}
                    >
                      <TopNav />
                      {children}
                    </div>
                    <div
                      className="fixed top-0 left-0 right-0 z-30 bg-paper pointer-events-none"
                      style={{ height: "env(safe-area-inset-top)" }}
                      aria-hidden="true"
                    />
                  </>
                ) : (
                  <MobileInstallPrompt
                    heading="Add this app to shop"
                    body="Browsing and checkout run best as an installed app on your phone — it's quick to add, and keeps things fast and secure."
                  />
                )}
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
                  className="w-full min-h-screen"
                  style={{ paddingTop: isImmersive ? undefined : "env(safe-area-inset-top)" }}
                >
                  {!isImmersive && <TopNav />}
                  {children}
                </div>
                {!isImmersive && (
                  <div
                    className="fixed top-0 left-0 right-0 z-30 bg-paper pointer-events-none"
                    style={{ height: "env(safe-area-inset-top)" }}
                    aria-hidden="true"
                  />
                )}
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
