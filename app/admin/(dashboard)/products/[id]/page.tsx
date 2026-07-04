import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { updateProduct, deleteProduct } from "./actions";
import ProductImageManager from "@/components/admin/ProductImageManager";
import DeleteProductForm from "@/components/admin/DeleteProductForm";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  const admin = createAdminClient();
  const { data: product } = await admin.from("ariana_products").select("*").eq("id", id).single();
  if (!product) return null;

  const { data: images } = await admin
    .from("ariana_product_images")
    .select("id, url, alt")
    .eq("product_id", id)
    .order("position", { ascending: true });

  return { product, images: images ?? [] };
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProduct(id);
  if (!result) notFound();

  const { product, images } = result;
  const boundUpdate = updateProduct.bind(null, id);
  const boundDelete = deleteProduct.bind(null, id);

  return (
    <div className="max-w-lg">
      <div className="flex items-center justify-between mb-2 text-sm">
        <Link href="/admin/products" className="text-muted hover:text-ink transition-colors">
          ← All products
        </Link>
        <Link href="/admin/products/new" className="text-brass hover:underline">
          + Add another product
        </Link>
      </div>

      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Editing: {product.name}</h1>
        <DeleteProductForm action={boundDelete} />
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium mb-3">Images</p>
        <ProductImageManager productId={id} images={images} />
      </div>

      <form action={boundUpdate} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            name="name"
            defaultValue={product.name}
            required
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Price (USD)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            defaultValue={product.price}
            required
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            name="category"
            defaultValue={product.category ?? ""}
            required
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Select a category</option>
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="is_published" type="checkbox" defaultChecked={product.is_published} />
          Published
        </label>

        <button
          type="submit"
          className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
