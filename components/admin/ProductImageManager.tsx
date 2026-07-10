"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type ProductImage = { id: string; url: string; alt: string | null };

async function uploadDirect(productId: string, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  const signRes = await fetch(`/api/admin/products/${productId}/images/sign-upload`, {
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

export default function ProductImageManager({
  productId,
  images,
}: {
  productId: string;
  images: ProductImage[];
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("Choose an image first.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const imageUrl = await uploadDirect(productId, file);

      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this image?")) return;
    const res = await fetch(`/api/admin/products/${productId}/images?imageId=${imageId}`, { method: "DELETE" });
    const result: { error?: string } = await res.json();
    if (result.error) {
      alert(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-3 mb-4">
          {images.map((img) => (
            <div key={img.id} className="w-24">
              <div className="w-24 h-32 rounded overflow-hidden border border-ink/10 bg-paper-raised">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} className="w-full h-full object-cover" />
              </div>
              <button
                onClick={() => handleDelete(img.id)}
                className="text-xs text-red-700 hover:underline mt-1"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2 mb-3">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2 mb-3">Image added.</p>}

      <form onSubmit={handleUpload} className="flex items-center gap-3">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="text-sm px-3 py-1.5 bg-ink text-paper rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Uploading…" : "Add image"}
        </button>
      </form>
    </div>
  );
}
