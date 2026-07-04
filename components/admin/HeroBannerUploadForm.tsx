"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

async function uploadDirect(file: File, device: "desktop" | "mobile"): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";

  const signRes = await fetch("/api/admin/hero/sign-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ variant: device, ext }),
  });
  const signed = await signRes.json();
  if (signed.error) throw new Error(signed.error);

  const supabase = getSupabase();
  const { error: uploadErr } = await supabase.storage
    .from("hero-banners")
    .uploadToSignedUrl(signed.path, signed.token, file);
  if (uploadErr) throw new Error(uploadErr.message);

  const { data } = supabase.storage.from("hero-banners").getPublicUrl(signed.path);
  return data.publicUrl;
}

export default function HeroBannerUploadForm({ device }: { device: "desktop" | "mobile" }) {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!label.trim() || !file) {
      setError("Label and an image are both required.");
      return;
    }
    setPending(true);
    setError(null);

    try {
      setStatus("Uploading…");
      const imageUrl = await uploadDirect(file, device);

      setStatus("Publishing…");
      const res = await fetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, href, imageUrl, device }),
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
      setFile(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPending(false);
      setStatus(null);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border border-ink/10 rounded-lg p-4 max-w-md space-y-4">
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}

      <div>
        <label className="block text-sm mb-1">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={device === "desktop" ? "e.g. Coffee Brown — wide shot" : "e.g. Coffee Brown — portrait"}
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Link (optional)</label>
        <input
          value={href}
          onChange={(e) => setHref(e.target.value)}
          placeholder="/catalog"
          className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">
          {device === "desktop" ? "Desktop image" : "Mobile image"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm"
        />
        <p className="text-xs text-muted mt-1">
          {device === "desktop" ? "Wide/landscape — shown on desktop browsers only." : "Tall/portrait — shown on phones only."}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {pending ? status ?? "Working…" : `Publish ${device} banner`}
      </button>
    </form>
  );
}
