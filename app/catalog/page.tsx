import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getCategories } from "@/lib/categories";
import AddToCartButton from "@/components/AddToCartButton";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

async function getProducts(category?: string) {
  const supabase = getSupabase();
  let query = supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, category, ariana_product_images(url, position)")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data } = await query;
  return (data as unknown as ProductRow[]) ?? [];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const [products, categories] = await Promise.all([getProducts(category), getCategories()]);

  return (
    <main className="px-6 md:px-10 py-16 md:py-20 max-w-7xl mx-auto">
      <h1 className="font-display text-4xl md:text-5xl mb-8">Catalog</h1>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/catalog"
          className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
            !category ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink/40"
          }`}
        >
          All
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/catalog?category=${encodeURIComponent(c.name)}`}
            className={`text-sm px-3 py-1.5 rounded-full border transition-colors ${
              category === c.name ? "bg-ink text-paper border-ink" : "border-ink/20 hover:border-ink/40"
            }`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className="text-muted">No products {category ? `in ${category} ` : ""}yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10">
          {products.map((p) => {
            const image = [...(p.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0];
            return (
              <Link key={p.id} href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden bg-paper-raised mb-3">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image.url}
                      alt={p.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                      No image
                    </div>
                  )}
                </div>
                <p className="text-sm text-ink">{p.name}</p>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">{formatPrice(p.price, p.currency)}</p>
                  <AddToCartButton
                    productId={p.id}
                    name={p.name}
                    price={p.price}
                    currency={p.currency}
                    image={image?.url ?? ""}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
