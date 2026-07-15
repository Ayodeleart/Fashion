"use client";

import { useRouter } from "next/navigation";

export default function SmartBackButton({
  fallbackHref,
  className,
  children,
  ariaLabel = "Back",
}: {
  fallbackHref: string;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => {
        // Real browser-history back — this is what preserves whatever
        // category filter (or lack of one) and scroll position the
        // person actually had on /catalog. Only fall back to a fresh
        // navigation if there's no history to go back to (e.g. this
        // product was opened directly from a shared link).
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={className}
    >
      {children}
    </button>
  );
}
