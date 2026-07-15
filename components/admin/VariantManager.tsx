"use client";

import { useActionState } from "react";

type Variant = { id: string; size: string; color: string | null; stock: number };
type ActionResult = { error: string | null };

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export default function VariantManager({
  productId,
  variants,
  onAdd,
  onDelete,
}: {
  productId: string;
  variants: Variant[];
  onAdd: (formData: FormData) => Promise<ActionResult>;
  onDelete: (variantId: string, productId: string) => Promise<void>;
}) {
  const [state, formAction, pending] = useActionState<ActionResult, FormData>(
    async (_prev, formData) => onAdd(formData),
    { error: null }
  );

  return (
    <div>
      <p className="text-sm font-medium mb-3">Sizes</p>
      <p className="text-xs text-muted mb-3">
        Toggle every size this piece comes in, add a color and stock count, then Add once — this creates
        all of them together instead of one at a time. Native wear doesn&apos;t always fit true to size (a
        tall person can wear Small, a shorter person can need XXL), so treat these as labels, not measurements —
        use the custom field for anything that isn&apos;t S–XXL (e.g. &ldquo;Free Size&rdquo;, a waist number).
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

      <form action={formAction} className="space-y-3">
        <div>
          <label className="block text-xs mb-1.5">Sizes (pick as many as apply)</label>
          <div className="flex flex-wrap gap-2">
            {STANDARD_SIZES.map((size) => (
              <label key={size} className="cursor-pointer">
                <input type="checkbox" name="sizes" value={size} className="peer hidden" />
                <span className="inline-flex items-center justify-center w-11 h-9 rounded border border-ink/20 text-sm peer-checked:bg-ink peer-checked:text-white peer-checked:border-ink transition-colors">
                  {size}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 items-end">
          <div>
            <label className="block text-xs mb-1">Custom size (optional)</label>
            <input
              name="customSize"
              placeholder="Free Size"
              className="w-28 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white"
            />
          </div>
          <div>
            <label className="block text-xs mb-1">Color (optional)</label>
            <input name="color" placeholder="Gold" className="w-28 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white" />
          </div>
          <div>
            <label className="block text-xs mb-1">Stock (applies to each size above)</label>
            <input name="stock" type="number" defaultValue={0} className="w-20 border border-ink/20 rounded px-2 py-1.5 text-sm bg-white" />
          </div>
          <button type="submit" disabled={pending} className="bg-ink text-white text-sm rounded px-4 py-1.5 disabled:opacity-50">
            {pending ? "Adding…" : "Add"}
          </button>
        </div>
      </form>
      {state.error && <p className="text-xs text-red-600 mt-2">{state.error}</p>}
      {!pending && !state.error && state !== undefined && (
        <p className="text-xs text-muted mt-2" key={variants.length}>
          {variants.length > 0 ? `${variants.length} size${variants.length === 1 ? "" : "s"} saved.` : ""}
        </p>
      )}
    </div>
  );
}
