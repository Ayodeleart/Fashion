"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

// Only these are the e-commerce ("shop") surfaces — they get the mobile
// app shell (bottom nav, cart/saved context, install prompt). Everything
// else (the editorial "/" landing page, "/about", etc.) renders as-is,
// and "/admin" is untouched entirely.
const SHOP_PREFIXES = ["/catalog", "/cart", "/saved", "/account", "/search", "/reels", "/auth", "/product", "/checkout"];

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isImmersive = pathname.startsWith("/reels");

  if (!isShop) return <>{children}</>;

  return (
    <>
      {/* The shop is a mobile-only experience by design — no desktop
          version. Below md (768px) this renders full-bleed edge to edge;
          at md and above we show a dedicated message instead of a
          squeezed, centered mobile layout floating in a wide viewport. */}
      <div className="md:hidden w-full min-h-screen">
        <CartProvider>
          <SavedProvider>
            <div className={`w-full min-h-screen ${isImmersive ? "" : "pb-28"}`}>{children}</div>
            <BottomNav transparent={isImmersive} />
            <InstallPrompt />
          </SavedProvider>
        </CartProvider>
      </div>

      <div className="hidden md:flex min-h-screen items-center justify-center px-6 text-center bg-paper">
        <div className="max-w-sm">
          <h1 className="font-display text-2xl mb-2">This is a mobile experience</h1>
          <p className="text-sm text-muted">
            The shop is designed for phones — open this page on your mobile device to browse and check out.
          </p>
          <a href="/" className="inline-block mt-6 text-sm underline text-ink">
            Back to the homepage
          </a>
        </div>
      </div>
    </>
  );
}
