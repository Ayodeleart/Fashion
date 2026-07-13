import Link from "next/link";
import type { Category } from "@/lib/categories";

export default function CategoryRow({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="px-4 pt-3 pb-2.5">
      <div className="flex gap-3.5 overflow-x-auto no-scrollbar">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/catalog?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-1.5 shrink-0 w-14">
            <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-brass via-ink/60 to-brass">
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-paper bg-paper-raised">
                {cat.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={cat.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                    {cat.name.slice(0, 1)}
                  </div>
                )}
              </div>
            </div>
            <span className="text-[10px] text-center leading-tight truncate w-full">{cat.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
