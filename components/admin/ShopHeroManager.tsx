"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Banner = { id: string; label: string | null; imageUrl: string; href: string | null };

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const signRes = await fetch("/api/admin/shop-hero/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error } = await supabase.storage.from("shop-hero").uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("shop-hero").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function ShopHeroManager({ initialBanners }: { initialBanners: Banner[] }) {
  const router = useRouter();
  const [banners, setBanners] = useState(initialBanners);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setError("An image is required.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      setStatus("Uploading…");
      const imageUrl = await uploadImage(file);

      setStatus("Publishing…");
      const res = await fetch("/api/admin/shop-hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href, imageUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setLabel("");
      setHref("");
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
    if (!confirm("Delete this hero banner?")) return;
    setBanners((prev) => prev.filter((b) => b.id !== id));
    const res = await fetch(`/api/admin/shop-hero?id=${id}`, { method: "DELETE" });
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
          <label className="block text-sm mb-1">Title shown on the card</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Fresh wine"
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Link (optional)</label>
          <input
            value={href}
            onChange={(e) => setHref(e.target.value)}
            placeholder="/catalog?category=..."
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Image (portrait, ~4:5)</label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? status ?? "Working…" : "Publish"}
        </button>
      </form>

      <ul className="divide-y divide-ink/10 border border-ink/10 rounded-lg">
        {banners.length === 0 && <li className="p-4 text-sm text-muted">No shop hero banners yet.</li>}
        {banners.map((b) => (
          <li key={b.id} className="flex items-center gap-3 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt="" className="w-12 h-16 rounded object-cover border border-ink/10" />
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{b.label || "(untitled)"}</p>
              <p className="text-xs text-muted truncate">{b.href || "—"}</p>
            </div>
            <button onClick={() => handleDelete(b.id)} className="text-xs px-2 py-1 rounded text-red-700 hover:bg-red-50 transition-colors">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
