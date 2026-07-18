"use client";

import { useEffect, useState } from "react";
import { isStandalone } from "@/lib/pwa-standalone";
import MobileInstallPrompt from "@/components/MobileInstallPrompt";

export default function InstallGate({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setInstalled(isStandalone());
    setReady(true);

    function handleInstalled() {
      setInstalled(true);
    }
    window.addEventListener("appinstalled", handleInstalled);
    return () => window.removeEventListener("appinstalled", handleInstalled);
  }, []);

  // Avoid a flash of the wrong state — this check is fast and client-only.
  if (!ready) return null;

  if (installed) return <>{children}</>;

  return (
    <>
      {/* Mobile: real install instructions/button */}
      <div className="md:hidden">
        <MobileInstallPrompt />
      </div>

      {/* Desktop: this route was built mobile-only, point them to a phone instead */}
      <div className="hidden md:flex min-h-screen items-center justify-center px-6 bg-paper text-center">
        <div className="max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-ink text-paper flex items-center justify-center mx-auto mb-6 font-display text-xl">
            AG
          </div>
          <h1 className="font-display text-2xl mb-2">Open this on your phone</h1>
          <p className="text-sm text-muted">
            This page is a mobile app experience — visit this link on your phone and add it to your home screen to use it.
          </p>
        </div>
      </div>
    </>
  );
}
