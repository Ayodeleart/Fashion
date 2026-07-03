import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";

export default async function AdminProductsPage() {
  let products: { id: string; name: string; price: number; currency: string; is_published: boolean }[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("products")
      .select("id, name, price, currency, is_published")
      .order("created_at", { ascending: false });
    if (error) throw error;
    products = data ?? [];
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
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-ink/10">
              <th className="py-2 font-normal">Name</th>
              <th className="py-2 font-normal">Price</th>
              <th className="py-2 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-ink/5">
                <td className="py-3">
                  <Link href={`/admin/products/${p.id}`} className="hover:text-brass">
                    {p.name}
                  </Link>
                </td>
                <td className="py-3">{p.currency} {p.price}</td>
                <td className="py-3">{p.is_published ? "Published" : "Draft"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
