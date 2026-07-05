"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/components/CartProvider";
import { SavedProvider } from "@/components/SavedProvider";
import BottomNav from "@/components/BottomNav";
import InstallPrompt from "@/components/InstallPrompt";

export default function StorefrontChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) return <>{children}</>;

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
