"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

type Banner = {
  enabled: boolean;
  title: string;
  message: string;
  cta_text: string;
  cta_href: string;
  image_url: string | null;
} | null;

async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const signRes = await fetch("/api/admin/promo-banner/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error } = await supabase.storage.from("promo-banner").uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("promo-banner").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function PromoBannerForm({ initial }: { initial: Banner }) {
  const [enabled, setEnabled] = useState(initial?.enabled ?? false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [ctaText, setCtaText] = useState(initial?.cta_text ?? "Shop now");
  const [ctaHref, setCtaHref] = useState(initial?.cta_href ?? "/catalog");
  const [imageUrl, setImageUrl] = useState(initial?.image_url ?? "");
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
      let finalImageUrl = imageUrl;
      if (file) {
        setStatus("Uploading image…");
        finalImageUrl = await uploadImage(file);
        setImageUrl(finalImageUrl);
      }

      setStatus("Saving…");
      const res = await fetch("/api/admin/promo-banner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled, title, message, ctaText, ctaHref, imageUrl: finalImageUrl }),
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

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Show this banner
      </label>

      <div>
        <label className="block text-sm mb-1">Image (optional — portrait works best, ~4:5)</label>
        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-sm" />
        {(file || imageUrl) && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={file ? URL.createObjectURL(file) : imageUrl}
            alt=""
            className="w-24 h-30 rounded-lg object-cover border border-ink/10 mt-3"
          />
        )}
        {imageUrl && !file && (
          <button
            type="button"
            onClick={() => setImageUrl("")}
            className="block text-xs text-red-700 mt-2 underline"
          >
            Remove image
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm mb-1">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="20% off this week"
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="On all Aso Oke pieces, this week only."
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white resize-none"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Button text</label>
        <input
          value={ctaText}
          onChange={(e) => setCtaText(e.target.value)}
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <div>
        <label className="block text-sm mb-1">Button link</label>
        <input
          value={ctaHref}
          onChange={(e) => setCtaHref(e.target.value)}
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>
      <button type="submit" disabled={pending} className="bg-ink text-white text-sm rounded px-5 py-2.5 disabled:opacity-50">
        {pending ? status ?? "Saving…" : "Save"}
      </button>
    </form>
  );
}
