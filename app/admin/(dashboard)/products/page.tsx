import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";

// Forced dynamic: this page reads live data on every request, so it
// should never be statically prerendered at build time (which would
// require real Supabase env vars to exist in the build environment).
export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string;
  price: number;
  currency: string;
  is_published: boolean;
  category: string | null;
  ariana_product_images: { url: string }[];
};

export default async function AdminProductsPage() {
  let products: ProductRow[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("ariana_products")
      .select("id, name, price, currency, is_published, category, ariana_product_images(url)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    products = (data as unknown as ProductRow[]) ?? [];
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load products.";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Products</h1>
        <Link
          href="/admin/products/new"
          className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
        >
          New product
        </Link>
      </div>

      {loadError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 mb-6">
          {loadError} — likely the pending Supabase connector approval or missing env vars.
        </p>
      )}

      {!loadError && products.length === 0 && (
        <p className="text-sm text-muted">No products yet.</p>
      )}

      {products.length > 0 && (
        <div className="space-y-2">
          {products.map((p) => {
            const thumb = p.ariana_product_images?.[0]?.url;
            return (
              <div
                key={p.id}
                className="flex items-center gap-4 border border-ink/10 rounded-lg p-3"
              >
                <div className="w-14 h-18 shrink-0 rounded overflow-hidden bg-paper-raised border border-ink/10">
                  {thumb ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] text-muted text-center px-1">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link href={`/admin/products/${p.id}`} className="font-medium hover:text-brass block truncate">
                    {p.name}
                  </Link>
                  <p className="text-sm text-muted">
                    {p.currency} {p.price}
                    {p.category && <> · {p.category}</>}
                    {" · "}
                    {p.is_published ? "Published" : "Draft"}
                  </p>
                </div>

                <Link
                  href={`/admin/products/${p.id}`}
                  className="shrink-0 text-sm px-3 py-1.5 border border-ink/20 rounded hover:bg-ink/5 transition-colors"
                >
                  Edit
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
