"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function RegisterSW() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname.startsWith("/admin")) return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Installability still works without a functioning SW registration
      // in most browsers as long as the manifest is valid; fail silently.
    });
  }, [pathname]);

  return null;
}
