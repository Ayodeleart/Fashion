"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

async function uploadDirect(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  const signRes = await fetch("/api/admin/lookbook/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error: uploadErr } = await supabase.storage
    .from("lookbook")
    .uploadToSignedUrl(signed.path, signed.token, file);
  if (uploadErr) throw new Error(uploadErr.message);

  const { data } = supabase.storage.from("lookbook").getPublicUrl(signed.path);
  return data.publicUrl;
}

const CATEGORIES = [
  { value: "seasonal", label: "This season's edit" },
  { value: "trending", label: "Trending this week" },
  { value: "editors-choice", label: "Editor's choice" },
  { value: "wedding", label: "Wedding inspiration" },
  { value: "celebrity", label: "Celebrity looks" },
  { value: "aso-oke", label: "Luxury aso oke" },
  { value: "corporate", label: "Corporate fits" },
  { value: "streetwear", label: "Streetwear" },
  { value: "weekend", label: "Weekend looks" },
  { value: "couple", label: "Couple styles" },
  { value: "traditional", label: "Traditional styles" },
  { value: "designer-spotlight", label: "Designer spotlight" },
];

export default function LookbookUploadForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("seasonal");
  const [story, setStory] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !file) {
      setError("Label and image are both required.");
      return;
    }
    setPending(true);
    setError(null);
    setSuccess(false);

    try {
      const imageUrl = await uploadDirect(file);

      const res = await fetch("/api/admin/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, category, story, href: href || "#", imageUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setLabel("");
      setStory("");
      setHref("");
      setFile(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 border border-ink/10 rounded p-5">
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-2">Panel added.</p>}

      <div>
        <label className="block text-sm mb-1">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. The Tailored Line"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Chapter</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted mt-1">Which section of the Home style book this look appears in.</p>
      </div>

      <div>
        <label className="block text-sm mb-1">Story (optional)</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="A sentence or two shown when someone taps this look."
          rows={3}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Shop this look link (optional)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/catalog?look=tailored"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
        <p className="text-xs text-muted mt-1">Where "Shop this look" sends the customer.</p>
      </div>

      <div>
        <label className="block text-sm mb-1">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? "Uploading…" : "Add panel"}
      </button>
    </form>
  );
}
