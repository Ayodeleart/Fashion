"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSaved, type SavedItem } from "@/components/SavedProvider";

export default function SaveButton({ item, className }: { item: SavedItem; className?: string }) {
  const { isSaved, toggle } = useSaved();
  const router = useRouter();
  const pathname = usePathname();
  const saved = isSaved(item.productId);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={saved ? "Remove from saved" : "Save"}
        onClick={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setError(null);
          const result = await toggle(item);
          if (result.requiresAuth) {
            router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
            return;
          }
          if (result.error) {
            setError("Couldn't save — try again.");
            setTimeout(() => setError(null), 2500);
          }
        }}
        className={className ?? "w-8 h-8 rounded-full bg-white/90 text-black flex items-center justify-center shrink-0"}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "rgb(var(--brass))" : "none"}>
          <path
            d="M12 20s-7.5-4.6-9.6-9.2C1.2 7.6 3 4.5 6.3 4.1c2-.2 3.7.9 5.7 3 2-2.1 3.7-3.2 5.7-3 3.3.4 5.1 3.5 3.9 6.7C19.5 15.4 12 20 12 20Z"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {error && (
        <span className="absolute top-full right-0 mt-1 whitespace-nowrap text-[10px] bg-ink text-paper rounded px-2 py-1 z-10">
          {error}
        </span>
      )}
    </div>
  );
}
