"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { PRODUCT_CATEGORIES } from "@/lib/product-categories";

async function uploadDirect(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  const signRes = await fetch("/api/admin/products/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error: uploadErr } = await supabase.storage
    .from("product-images")
    .uploadToSignedUrl(signed.path, signed.token, file);
  if (uploadErr) throw new Error(uploadErr.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    setFiles(Array.from(e.target.files ?? []));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !price || !category) {
      setError("Name, price, and category are required.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      const imageUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setStatus(`Uploading image ${i + 1} of ${files.length}…`);
        imageUrls.push(await uploadDirect(files[i]));
      }

      setStatus("Saving product…");
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price), category, description, isPublished, imageUrls }),
      });
      const result: { id?: string; error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      router.push(`/admin/products/${result.id}`);
      setPending(false);
      setStatus(null);
      setName("");
      setPrice("");
      setCategory("");
      setDescription("");
      setIsPublished(false);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create product.");
      setPending(false);
      setStatus(null);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="font-display text-3xl mb-6">New product</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}

        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Price (USD)</label>
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            type="number"
            step="0.01"
            required
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Images</label>
          <input type="file" accept="image/*" multiple onChange={handleFiles} className="text-sm" />
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {files.map((f, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-16 h-20 object-cover rounded border border-ink/10"
                />
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={pending}
          className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {pending ? status ?? "Working…" : "Save product"}
        </button>
      </form>
    </div>
  );
}
