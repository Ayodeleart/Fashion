"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function InstallSteps({ deferredPrompt }: { deferredPrompt: BeforeInstallPromptEvent | null }) {
  if (deferredPrompt) {
    return (
      <button
        onClick={() => deferredPrompt.prompt()}
        className="w-full bg-ink text-paper rounded-full px-4 py-3 text-sm font-medium"
      >
        Install now
      </button>
    );
  }

  if (isIOS()) {
    return (
      <ol className="text-sm text-left space-y-3 bg-paper-raised rounded-2xl p-4">
        <li>1. Tap the <strong>Share</strong> icon in Safari&apos;s toolbar.</li>
        <li>2. Scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.</li>
        <li>3. Tap <strong>Add</strong>, then open the app from your home screen.</li>
      </ol>
    );
  }

  return (
    <ol className="text-sm text-left space-y-3 bg-paper-raised rounded-2xl p-4">
      <li>1. Open your browser menu (usually ⋮ or ⋯).</li>
      <li>2. Tap <strong>&ldquo;Add to Home screen&rdquo;</strong> or <strong>&ldquo;Install app&rdquo;</strong>.</li>
      <li>3. Open the app from your home screen.</li>
    </ol>
  );
}

/**
 * Full-screen install prompt for phone browsers. Desktop never sees this —
 * callers are expected to only mount it inside a mobile-only branch (e.g.
 * StorefrontChrome's `md:hidden` column), since desktop gets a real browser
 * storefront instead of an install requirement.
 */
export default function MobileInstallPrompt({ heading, body }: { heading?: string; body?: string }) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 bg-paper text-center">
      <div className="max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-ink text-paper flex items-center justify-center mx-auto mb-6 font-display text-xl">
          AG
        </div>
        <h1 className="font-display text-2xl mb-2">{heading ?? "Add this app to your Home Screen"}</h1>
        <p className="text-sm text-muted mb-6">
          {body ?? "This shop only opens as an installed app — it's quick, and keeps things fast and secure at checkout."}
        </p>
        <InstallSteps deferredPrompt={deferredPrompt} />
        <Link href="/" className="inline-block mt-6 text-sm underline text-ink">
          Back to the homepage
        </Link>
      </div>
    </main>
  );
}
