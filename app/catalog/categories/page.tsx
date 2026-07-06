import Link from "next/link";
import { getCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function AllCategoriesPage() {
  const categories = await getCategories();

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">All Categories</h1>

      {categories.length === 0 ? (
        <p className="text-sm text-muted">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalog?category=${encodeURIComponent(cat.name)}`}
              className="relative aspect-square rounded-2xl overflow-hidden bg-paper-raised flex items-end p-3"
            >
              {cat.thumbnailUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cat.thumbnailUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="relative text-sm text-white font-medium">{cat.name}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
