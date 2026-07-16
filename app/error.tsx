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
    console.error("Uncaught render error:", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center">
      <p className="text-xs tracking-[0.15em] uppercase text-muted mb-3">Something went wrong</p>
      <h1 className="font-display text-2xl md:text-3xl text-ink mb-3">
        That page hit a snag
      </h1>
      <p className="text-sm text-ink/70 max-w-sm mb-8">
        Give it another try — if it keeps happening, head back home.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-ink text-paper text-sm font-medium hover:bg-ink/90 transition-colors"
        >
          Try again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-ink/15 text-ink text-sm font-medium"
        >
          Back to Home
        </a>
      </div>
    </main>
  );
}
