"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Sheet from "@/components/Sheet";
import type { Category } from "@/lib/categories";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
] as const;

export default function FilterSortRow({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [openSheet, setOpenSheet] = useState<"filter" | "sort" | null>(null);

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") ?? "newest";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  }

  const sortLabel = SORT_OPTIONS.find((s) => s.value === activeSort)?.label ?? "Sort";

  return (
    <div className="sticky top-[96px] z-10 flex gap-2 px-5 py-2.5 bg-paper border-b border-ink/8 md:hidden">
      <button
        type="button"
        onClick={() => setOpenSheet("filter")}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-ink/15"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
        </svg>
        {activeCategory ?? "Filter"}
      </button>
      <button
        type="button"
        onClick={() => setOpenSheet("sort")}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-ink/15"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
          <path d="M7 4v16m0-16 3.5 3.5M7 4 3.5 7.5M17 20V4m0 16-3.5-3.5M17 20l3.5-3.5" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {sortLabel}
      </button>

      <Sheet open={openSheet === "filter"} onClose={() => setOpenSheet(null)} title="Filter">
        <div className="flex flex-col">
          <button
            onClick={() => { updateParam("category", null); setOpenSheet(null); }}
            className={`text-left py-2.5 text-sm ${!activeCategory ? "text-ink font-medium" : "text-muted"}`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { updateParam("category", c.name); setOpenSheet(null); }}
              className={`text-left py-2.5 text-sm ${activeCategory === c.name ? "text-ink font-medium" : "text-muted"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={openSheet === "sort"} onClose={() => setOpenSheet(null)} title="Sort">
        <div className="flex flex-col">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { updateParam("sort", opt.value === "newest" ? null : opt.value); setOpenSheet(null); }}
              className={`text-left py-2.5 text-sm ${activeSort === opt.value ? "text-ink font-medium" : "text-muted"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
