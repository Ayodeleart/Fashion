import Link from "next/link";
import type { Category } from "@/lib/categories";

export default function CategoryRow({ categories }: { categories: Category[] }) {
  return (
    <div className="px-5 pt-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold">Shop by Categories</h2>
        <Link href="/catalog/categories" className="text-xs text-muted">See all</Link>
      </div>

      {categories.length === 0 ? (
        <p className="text-xs text-muted pb-4">
          No categories yet — add some from the admin dashboard.
        </p>
      ) : (
        // Only this icon row is sticky — a slim persistent strip for
        // quick category jumping while scrolling. The heading above
        // scrolls away normally; bundling it into the sticky bar too
        // made it look like the whole header kept re-entering the
        // screen every time you scrolled.
        <section className="sticky top-0 z-20 bg-paper pb-4 -mx-5 px-5">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <Link key={cat.id} href={`/catalog?category=${encodeURIComponent(cat.name)}`} className="flex flex-col items-center gap-2 shrink-0 w-16">
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-brass via-ink/60 to-brass">
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
                <span className="text-[11px] text-center leading-tight">{cat.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
