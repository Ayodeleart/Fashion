"use client";

export function ShareButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        if (navigator.share) {
          try {
            await navigator.share({ title: label, url });
          } catch {
            // user cancelled — no-op
          }
          return;
        }
        try {
          await navigator.clipboard.writeText(url);
        } catch {
          // clipboard blocked — no-op, nothing else we can do silently
        }
      }}
      className="shrink-0 w-12 h-12 rounded-full border border-ink/10 text-ink flex items-center justify-center"
      aria-label="Share"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="M8.6 10.6l6.8-3.8M8.6 13.4l6.8 3.8" />
      </svg>
    </button>
  );
}
