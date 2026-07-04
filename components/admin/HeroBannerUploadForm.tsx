"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HeroBannerUploadForm() {
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [mobileFile, setMobileFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      const form = new FormData();
      form.set("label", label);
      form.set("href", href);
      form.set("desktop", desktopFile);
      form.set("mobile", mobileFile);

      const res = await fetch("/api/admin/hero", { method: "POST", body: form });
      const result: { error?: string } = await res.json();
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
        {pending ? "Uploading…" : "Publish banner"}
      </button>
    </form>
  );
}
