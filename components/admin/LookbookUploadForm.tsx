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

export default function LookbookUploadForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !file) {
      setError("Label and image are both required.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      const imageUrl = await uploadDirect(file);

      const res = await fetch("/api/admin/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href: href || "#", imageUrl }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setLabel("");
      setHref("");
      setFile(null);
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
        <label className="block text-sm mb-1">Link (optional)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/catalog?look=tailored"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
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
