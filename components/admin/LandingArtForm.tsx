"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Section = { image_url: string | null; quote_top: string; quote_bottom: string } | null;

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const signRes = await fetch("/api/admin/landing-art/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error } = await supabase.storage.from("landing-art").uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("landing-art").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function LandingArtForm({ initial }: { initial: Section }) {
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
  const [quoteTop, setQuoteTop] = useState(initial?.quote_top ?? "WHERE ELEGANCE AND FASHION BECOMES ART");
  const [quoteBottom, setQuoteBottom] = useState(initial?.quote_bottom ?? "MEETS ELEGANCE AND FASHION BECOMES ART");
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setSuccess(false);
    try {
      let finalUrl = imageUrl;
      if (file) {
        setStatus("Uploading photo…");
        finalUrl = await uploadImage(file);
        setImageUrl(finalUrl);
      }
      setStatus("Saving…");
      const res = await fetch("/api/admin/landing-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: finalUrl, quoteTop, quoteBottom }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuccess(true);
      setFile(null);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>}
      {success && <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded p-3">Saved.</p>}

      <div>
        <label className="block text-sm mb-1">Portrait photo (portrait orientation works best)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {(file || imageUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file ? URL.createObjectURL(file) : imageUrl}
            alt=""
            className="w-28 h-36 rounded-lg object-cover border border-ink/10 mt-3"
          />
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Circular text — top half</label>
        <input
          value={quoteTop}
          onChange={(e) => setQuoteTop(e.target.value.toUpperCase())}
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Circular text — bottom half</label>
        <input
          value={quoteBottom}
          onChange={(e) => setQuoteBottom(e.target.value.toUpperCase())}
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <button type="submit" disabled={pending} className="bg-ink text-white text-sm rounded px-5 py-2.5 disabled:opacity-50">
        {pending ? status ?? "Saving…" : "Save"}
      </button>
    </form>
  );
}
