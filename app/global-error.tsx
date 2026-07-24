"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Unhandled app error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <main className="min-h-screen flex items-center justify-center px-6 bg-paper text-center">
          <div className="max-w-sm">
            <h1 className="font-display text-2xl mb-2 text-ink">Something went wrong</h1>
            <p className="text-sm text-muted mb-6">
              That's on us, not you. Try again, or go back to the home screen.
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="bg-ink text-paper rounded-full px-5 py-2.5 text-sm font-medium"
              >
                Try again
              </button>
              <a
                href="/catalog"
                className="border border-ink/20 rounded-full px-5 py-2.5 text-sm font-medium text-ink"
              >
                Go home
              </a>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
