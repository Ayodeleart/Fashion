"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Category = {
  id: string;
  name: string;
  slug: string;
  thumbnailUrl: string | null;
  position: number;
};

async function uploadThumbnail(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  const signRes = await fetch("/api/admin/categories/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error: uploadErr } = await supabase.storage
    .from("category-thumbnails")
    .uploadToSignedUrl(signed.path, signed.token, file);
  if (uploadErr) throw new Error(uploadErr.message);

  const { data } = supabase.storage.from("category-thumbnails").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function CategoryManager({ initialCategories }: { initialCategories: Category[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Give this category a name.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      let thumbnailUrl = "";
      if (file) {
        setStatus("Uploading thumbnail…");
        thumbnailUrl = await uploadThumbnail(file);
      }

      setStatus("Saving…");
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, thumbnailUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setName("");
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create category.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this category? Products already using it keep their category text.")) return;
    setCategories((prev) => prev.filter((c) => c.id !== id));
    const res = await fetch(`/api/admin/categories?id=${id}`, { method: "DELETE" });
    const result: { error?: string } = await res.json();
    if (result.error) {
      alert(result.error);
      router.refresh();
    }
  }

  async function handleRename(cat: Category) {
    const newName = prompt("Rename category", cat.name);
    if (!newName || !newName.trim() || newName.trim() === cat.name) return;
    const res = await fetch("/api/admin/categories", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: cat.id, name: newName.trim() }),
    });
    const result: { error?: string } = await res.json();
    if (result.error) return alert(result.error);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <form onSubmit={handleCreate} className="border border-ink/10 rounded-lg p-4 space-y-4">
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sunglass"
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Thumbnail</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          {file && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={URL.createObjectURL(file)}
              alt=""
              className="w-16 h-16 rounded-full object-cover border border-ink/10 mt-3"
            />
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {pending ? status ?? "Working…" : "Add category"}
        </button>
      </form>

      <ul className="divide-y divide-ink/10 border border-ink/10 rounded-lg">
        {categories.length === 0 && (
          <li className="p-4 text-sm text-muted">No categories yet — add your first one above.</li>
        )}
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-3 p-3">
            {cat.thumbnailUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={cat.thumbnailUrl} alt="" className="w-10 h-10 rounded-full object-cover border border-ink/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-paper-raised border border-ink/10" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{cat.name}</p>
              <p className="text-xs text-muted truncate">/{cat.slug}</p>
            </div>
            <button onClick={() => handleRename(cat)} className="text-xs px-2 py-1 rounded hover:bg-ink/5 transition-colors">
              Rename
            </button>
            <button onClick={() => handleDelete(cat.id)} className="text-xs px-2 py-1 rounded text-red-700 hover:bg-red-50 transition-colors">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
