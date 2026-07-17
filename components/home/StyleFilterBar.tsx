"use client";

const FILTERS = [
  "All",
  "Trending",
  "Editor's Pick",
  "Wedding",
  "Bridal",
  "Celebrity",
  "Aso Oke",
  "Agbada",
  "Ankara",
  "Corporate",
  "Luxury",
  "Casual",
  "Streetwear",
  "Men",
  "Women",
];

export default function StyleFilterBar({
  active,
  onChange,
}: {
  active: string;
  onChange: (filter: string) => void;
}) {
  return (
    <div className="sticky top-0 z-10 bg-paper shadow-[0_4px_16px_rgba(0,0,0,0.10)]">
      <div className="flex gap-2 overflow-x-auto px-3 md:px-6 py-3 no-scrollbar">
        {FILTERS.map((filter) => {
          const isActive = filter === active;
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onChange(filter)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-[12px] tracking-wide font-body whitespace-nowrap transition-colors ${
                isActive
                  ? "bg-ink text-paper"
                  : "bg-paper-raised text-muted hover:text-ink"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>
    </div>
  );
}
