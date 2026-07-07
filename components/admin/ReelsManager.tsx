"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Reel = {
  id: string;
  video_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  product_id: string | null;
  category_id: string | null;
};
type ProductOption = { id: string; name: string };
type CategoryOption = { id: string; name: string };

async function uploadVideo(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "mp4";
  const signRes = await fetch("/api/admin/reels/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error } = await supabase.storage.from("reels").uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("reels").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function ReelsManager({
  initialReels,
  products,
  categories,
}: {
  initialReels: Reel[];
  products: ProductOption[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [reels, setReels] = useState(initialReels);
  const [caption, setCaption] = useState("");
  const [productId, setProductId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("A video file is required.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      setStatus("Uploading video (this can take a bit)…");
      const videoUrl = await uploadVideo(file);

      setStatus("Publishing…");
      const res = await fetch("/api/admin/reels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, caption, productId: productId || null, categoryId: categoryId || null }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setCaption("");
      setProductId("");
      setCategoryId("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this reel?")) return;
    setReels((prev) => prev.filter((r) => r.id !== id));
    const res = await fetch(`/api/admin/reels?id=${id}`, { method: "DELETE" });
    const result: { error?: string } = await res.json();
    if (result.error) {
      alert(result.error);
      router.refresh();
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="border border-ink/10 rounded-lg p-4 space-y-4">
        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

        <div>
          <label className="block text-sm mb-1">Video file (mp4/webm, vertical works best)</label>
          <input type="file" accept="video/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </div>
        <div>
          <label className="block text-sm mb-1">Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A short line shown over the video"
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Category (determines the swipe group when tapped)</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">Uncategorized</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm mb-1">Link to a product (optional)</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          >
            <option value="">No product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={pending}
          className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? status ?? "Working…" : "Publish reel"}
        </button>
      </form>

      <ul className="divide-y divide-ink/10 border border-ink/10 rounded-lg">
        {reels.length === 0 && <li className="p-4 text-sm text-muted">No reels yet.</li>}
        {reels.map((r) => (
          <li key={r.id} className="flex items-center gap-3 p-3">
            <video src={r.video_url} className="w-12 h-16 rounded object-cover border border-ink/10 bg-ink" muted />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{r.caption || "(no caption)"}</p>
              <p className="text-xs text-muted truncate">
                {products.find((p) => p.id === r.product_id)?.name ?? "No product linked"}
                {" · "}
                {categories.find((c) => c.id === r.category_id)?.name ?? "Uncategorized"}
              </p>
            </div>
            <button onClick={() => handleDelete(r.id)} className="text-xs px-2 py-1 rounded text-red-700 hover:bg-red-50 transition-colors">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
