"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHelp] = useState(() => isIOS());

  useEffect(() => {
    if (isStandalone()) return;

    const justSignedIn = sessionStorage.getItem("ariana_just_signed_in") === "1";
    if (!justSignedIn) return;

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // iOS Safari never fires beforeinstallprompt — show manual instructions instead.
    if (showIOSHelp) {
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, [showIOSHelp]);

  function dismiss() {
    sessionStorage.removeItem("ariana_just_signed_in");
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-4 bottom-24 z-40 max-w-sm mx-auto bg-ink text-paper rounded-2xl p-4 shadow-xl">
      {showIOSHelp ? (
        <>
          <p className="text-sm font-medium mb-1">Add this app to your Home Screen</p>
          <p className="text-xs text-paper/80 mb-3">
            Tap the Share button, then &ldquo;Add to Home Screen&rdquo; — get the full app experience.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium mb-1">Install this app</p>
          <p className="text-xs text-paper/80 mb-3">Add it to your home screen for quick, full-screen access.</p>
        </>
      )}
      <div className="flex gap-2">
        {!showIOSHelp && (
          <button
            onClick={handleInstall}
            className="flex-1 bg-paper text-ink text-sm font-medium rounded-full py-2"
          >
            Install
          </button>
        )}
        <button onClick={dismiss} className="flex-1 border border-paper/30 text-sm rounded-full py-2">
          {showIOSHelp ? "Got it" : "Not now"}
        </button>
      </div>
    </div>
  );
}
