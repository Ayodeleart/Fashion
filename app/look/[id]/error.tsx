"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function LookErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Look detail page failed to render:", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-6 text-center gap-4">
      <p className="font-display text-2xl text-ink">This look didn't load</p>
      <p className="text-sm text-muted max-w-xs">
        Something went wrong pulling this one up. You can try again, or head back to browse.
      </p>
      <div className="flex gap-3 mt-2">
        <button
          onClick={reset}
          className="px-5 py-2.5 rounded-full bg-ink text-paper text-sm font-medium"
        >
          Try again
        </button>
        <Link href="/" className="px-5 py-2.5 rounded-full border border-ink/15 text-sm font-medium">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
