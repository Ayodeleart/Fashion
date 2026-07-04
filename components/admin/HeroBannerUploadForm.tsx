"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

async function uploadDirect(file: File, variant: "desktop" | "mobile"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  // 1. Ask our (tiny, JSON-only) server route for a signed upload slot.
  const signRes = await fetch("/api/admin/hero/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant, ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  // 2. Upload the actual file bytes straight to Supabase — this never
  //    touches Vercel, so there's no ~4.5MB function body limit here.
  //    Full-resolution images go through untouched.
  const supabase = getSupabase();
  const { error: uploadErr } = await supabase.storage
    .from("hero-banners")
    .uploadToSignedUrl(signed.path, signed.token, file);
  if (uploadErr) throw new Error(uploadErr.message);

  const { data } = supabase.storage.from("hero-banners").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function HeroBannerUploadForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !desktopFile || !mobileFile) {
      setError("Label, a desktop image, and a mobile image are all required.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      setStatus("Uploading desktop image…");
      const desktopUrl = await uploadDirect(desktopFile, "desktop");

      setStatus("Uploading mobile image…");
      const mobileUrl = await uploadDirect(mobileFile, "mobile");

      setStatus("Publishing…");
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href, desktopUrl, mobileUrl }),
      });

      let result: { error?: string } = {};
      try {
        result = await res.json();
      } catch {
        throw new Error(`Server returned an unexpected response (status ${res.status}).`);
      }
      if (result.error) throw new Error(result.error);

      setLabel("");
      setHref("");
      setDesktopFile(null);
      setMobileFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4 border border-ink/10 rounded p-5">
      <p className="text-xs text-muted">
        Upload the fully designed banner for each screen size — brand name, tagline, and any
        text should already be part of the image. No processing happens to these; they're
        shown exactly as uploaded.
      </p>

      {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-2">{error}</p>}

      <div>
        <label className="block text-sm mb-1">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Autumn/Winter drop"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Link (optional)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/catalog"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Desktop image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setDesktopFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <p className="text-xs text-muted mt-1">Wide/landscape — this is what shows on desktop browsers.</p>
      </div>

      <div>
        <label className="block text-sm mb-1">Mobile image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setMobileFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <p className="text-xs text-muted mt-1">Tall/portrait — this is what shows on phones.</p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? status ?? "Working…" : "Publish banner"}
      </button>
    </form>
  );
}
