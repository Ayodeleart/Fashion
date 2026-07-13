"use client";

import { useState } from "react";
import SaveButton from "@/components/SaveButton";

export default function StyleActions({
  id,
  label,
  image,
  href,
}: {
  id: string;
  label: string;
  image: string;
  href: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: label, text: `${label} — AyodeleGold`, url: shareUrl };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled the share sheet — not an error, do nothing.
      }
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <SaveButton
        item={{
          productId: `look-${id}`,
          name: label,
          price: 0,
          currency: "",
          image,
          href,
          kind: "look",
        }}
        className="w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center shrink-0"
      />

      <button
        type="button"
        onClick={handleShare}
        aria-label="Share this look"
        className="relative w-12 h-12 rounded-full border border-ink/15 flex items-center justify-center shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3v12M12 3 8 7M12 3l4 4M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        {copied && (
          <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[11px] text-muted whitespace-nowrap">
            Link copied
          </span>
        )}
      </button>

      <a
        href={href}
        className="flex-1 text-center text-sm font-medium px-5 py-3.5 rounded-full bg-ink text-paper"
      >
        Shop this look
      </a>
    </div>
  );
}
