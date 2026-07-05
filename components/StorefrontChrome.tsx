"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

// Only these are the e-commerce ("shop") surfaces — they get the mobile
// app shell (bottom nav, cart/saved context, install prompt, narrow
// mobile-width column). Everything else (the editorial "/" landing page,
// "/about", etc.) renders full-width with no shop chrome, and "/admin"
// is untouched entirely.
const SHOP_PREFIXES = ["/catalog", "/cart", "/saved", "/account", "/search", "/auth", "/product", "/checkout"];

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShop = SHOP_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (!isShop) return <>{children}</>;

  return (
    <CartProvider>
      <SavedProvider>
        <div className="pb-24 max-w-md mx-auto min-h-screen">{children}</div>
        <BottomNav />
        <InstallPrompt />
      </SavedProvider>
    </CartProvider>
  );
}
