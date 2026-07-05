"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSaved, type SavedItem } from "@/components/SavedProvider";

export default function SaveButton({ item, className }: { item: SavedItem; className?: string }) {
  const { isSaved, toggle } = useSaved();
  const router = useRouter();
  const pathname = usePathname();
  const saved = isSaved(item.productId);

  return (
    <button
      type="button"
      aria-label={saved ? "Remove from saved" : "Save"}
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const result = await toggle(item);
        if (result.requiresAuth) {
          router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
        }
      }}
      className={className ?? "w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shrink-0"}
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
  );
}
