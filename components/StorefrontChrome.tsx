"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import BottomNav from "@/components/BottomNav";
import InstallGate from "@/components/InstallGate";
import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme-shared";

// The whole shop is a mobile-only, install-gated experience by design —
// no desktop version, and no browsing in a plain mobile browser tab
// either. InstallGate blocks everything below until the site is running
// as an installed PWA (standalone display mode).
const SHOP_PREFIXES = ["/catalog", "/cart", "/saved", "/account", "/search", "/reels", "/auth", "/product", "/checkout"];

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const match = document.cookie.match(new RegExp(`${THEME_COOKIE_NAME}=(dark|light)`));
  return match?.[1] === "dark" ? "dark" : "light";
}

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isImmersive = pathname.startsWith("/reels");
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

  return (
    <div data-theme={theme} suppressHydrationWarning>
      <InstallGate>
        <div className="md:hidden w-full min-h-screen bg-paper">
          <CartProvider>
            <SavedProvider>
              <div className={`w-full min-h-screen ${isImmersive ? "" : "pb-28"}`}>{children}</div>
              <BottomNav />
            </SavedProvider>
          </CartProvider>
        </div>

        {/* Once installed, this is effectively a mobile app shell running in
            its own window — a desktop-sized standalone window is still
            possible in theory, so keep a minimal fallback rather than
            nothing, but this is not a designed desktop experience. */}
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
