"use client";

type Variant = { id: string; size: string; color: string | null; stock: number };

export default function VariantManager({
  productId,
  variants,
  onAdd,
  onDelete,
}: {
  productId: string;
  variants: Variant[];
  onAdd: (formData: FormData) => Promise<void>;
  onDelete: (variantId: string, productId: string) => Promise<void>;
}) {
  return (
    <div>
      <p className="text-sm font-medium mb-3">Sizes</p>
      <p className="text-xs text-muted mb-3">
        Add each available size (and stock count) here. These show up as tappable size buttons on the product page.
      </p>

      {variants.length > 0 && (
        <div className="flex flex-col gap-2 mb-4">
          {variants.map((v) => (
            <form
              key={v.id}
              action={onDelete.bind(null, v.id, productId)}
              className="flex items-center justify-between border border-ink/10 rounded px-3 py-2 text-sm"
            >
              <span>
                {v.size}
                {v.color ? ` · ${v.color}` : ""} — {v.stock} in stock
              </span>
              <button type="submit" className="text-xs text-red-600 hover:underline">
                Remove
              </button>
            </form>
          ))}
        </div>
      )}

      <form action={onAdd} className="flex flex-wrap gap-2 items-end">
        <div>
          <label className="block text-xs mb-1">Size</label>
          <input name="size" required placeholder="M" className="w-20 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs mb-1">Color (optional)</label>
          <input name="color" placeholder="Gold" className="w-28 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white" />
        </div>
        <div>
          <label className="block text-xs mb-1">Stock</label>
          <input name="stock" type="number" defaultValue={0} className="w-20 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white" />
        </div>
        <button type="submit" className="bg-ink text-white text-sm rounded px-4 py-1.5">
          Add
        </button>
      </form>
    </div>
  );
}
