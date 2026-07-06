"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

// The real e-commerce flow — browsing, product detail, cart, checkout —
// now gets a genuine desktop layout, not just a squeezed mobile view.
// Instagram-style app surfaces (reels, saved, account, search) stay
// phone-only for now; they were built as a mobile app experience and
// haven't been asked for on desktop.
const RESPONSIVE_SHOP_PREFIXES = ["/catalog", "/cart", "/product", "/checkout"];
const MOBILE_ONLY_PREFIXES = ["/saved", "/account", "/search", "/reels", "/auth"];
const SHOP_PREFIXES = [...RESPONSIVE_SHOP_PREFIXES, ...MOBILE_ONLY_PREFIXES];

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isResponsive = RESPONSIVE_SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isImmersive = pathname.startsWith("/reels");

  if (!isShop) return <>{children}</>;

  if (isResponsive) {
    return (
      <CartProvider>
        <SavedProvider>
          {/* Bottom nav is a phone-app pattern — desktop gets normal page
              flow with no reserved bottom padding for it. */}
          <div className="w-full min-h-screen pb-28 md:pb-0">{children}</div>
          <div className="md:hidden">
            <BottomNav />
          </div>
          <InstallPrompt />
        </SavedProvider>
      </CartProvider>
    );
  }

  return (
    <>
      {/* These remain mobile-only by design — app-style surfaces
          (reels, saved, account, search) with no desktop layout yet. */}
      <div className="md:hidden w-full min-h-screen">
        <CartProvider>
          <SavedProvider>
            <div className={`w-full min-h-screen ${isImmersive ? "" : "pb-28"}`}>{children}</div>
            <BottomNav />
            <InstallPrompt />
          </SavedProvider>
        </CartProvider>
      </div>

      <div className="hidden md:flex min-h-screen items-center justify-center px-6 text-center bg-paper">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl mb-2">This is a mobile experience</h1>
          <p className="text-sm text-muted">
            This section is designed for phones — open it on your mobile device.
          </p>
          <a href="/" className="inline-block mt-6 text-sm underline text-ink">
            Back to the homepage
          </a>
        </div>
      </div>
    </>
  );
}
