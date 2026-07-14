"use client";

import SaveButton from "@/components/SaveButton";

export function LookSaveButton({ id, label, image }: { id: string; label: string; image: string }) {
  return (
    <div className="flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-ink/15 text-ink text-sm w-full">
      <SaveButton
        item={{
          productId: id,
          name: label,
          price: 0,
          currency: "",
          image,
          href: `/look/${id}`,
          kind: "look",
        }}
        className="w-5 h-5 flex items-center justify-center shrink-0"
      />
      <span>Save</span>
    </div>
  );
}

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
      className="flex items-center justify-center gap-2 h-12 px-5 rounded-full border border-ink/15 text-ink text-sm w-full"
    >
      Share
    </button>
  );
}
