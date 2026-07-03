import { createProduct } from "./actions";

export default function NewProductPage() {
  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">New product</h1>

      <form action={createProduct} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input name="name" required className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm mb-1">Price (USD)</label>
          <input name="price" type="number" step="0.01" required className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <input name="category" className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white" />
        </div>

        <div>
          <label className="block text-sm mb-1">Description</label>
          <textarea name="description" rows={4} className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white" />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input name="is_published" type="checkbox" />
          Publish immediately
        </label>

        <button
          type="submit"
          className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
        >
          Save product
        </button>
      </form>
    </div>
  );
}
