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
      className="flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-ink/10 text-ink text-sm w-full"
    >
      Share
    </button>
  );
}
