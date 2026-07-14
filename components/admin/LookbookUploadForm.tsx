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
  { value: "wedding", label: "Wedding inspiration" },
  { value: "celebrity", label: "Celebrity looks" },
  { value: "aso-oke", label: "Luxury aso oke" },
  { value: "corporate", label: "Corporate fits" },
  { value: "streetwear", label: "Streetwear" },
  { value: "couple", label: "Couple styles" },
  { value: "traditional", label: "Traditional styles" },
  { value: "designer-spotlight", label: "Designer spotlight" },
];

const BADGES = [
  { value: "", label: "No badge" },
  { value: "ready-made", label: "Ready-Made" },
  { value: "bespoke", label: "Bespoke" },
  { value: "ready+bespoke", label: "Ready + Bespoke" },
];

const FEED_LAYOUTS = [
  { value: "", label: "Auto (let Home decide)" },
  { value: "full", label: "Full-width editorial" },
  { value: "portrait", label: "Portrait pair" },
  { value: "masonry", label: "Masonry" },
  { value: "dramatic", label: "Single dramatic image" },
  { value: "collage", label: "Collage" },
];

export default function LookbookUploadForm() {
  const router = useRouter();

  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("seasonal");
  const [story, setStory] = useState("");
  const [href, setHref] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [designerName, setDesignerName] = useState("");
  const [location, setLocation] = useState("");
  const [badge, setBadge] = useState("");
  const [fabric, setFabric] = useState("");
  const [occasion, setOccasion] = useState("");
  const [description, setDescription] = useState("");
  const [styleTags, setStyleTags] = useState("");
  const [feedLayout, setFeedLayout] = useState("");
  const [isEditorialBreak, setIsEditorialBreak] = useState(false);
  const [editorialLabel, setEditorialLabel] = useState("");
  const [isHero, setIsHero] = useState(false);
  const [galleryFiles, setGalleryFiles] = useState<FileList | null>(null);

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

      let galleryImages: string[] = [];
      if (galleryFiles && galleryFiles.length > 0) {
        galleryImages = await Promise.all(Array.from(galleryFiles).map(uploadDirect));
      }

      const res = await fetch("/api/admin/lookbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label,
          category,
          story,
          href: href || "#",
          imageUrl,
          designerName: designerName || null,
          location: location || null,
          badge: badge || null,
          fabric: fabric || null,
          occasion: occasion || null,
          description: description || null,
          styleTags: styleTags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          feedLayout: feedLayout || null,
          isEditorialBreak,
          editorialLabel: editorialLabel || null,
          isHero,
          galleryImages,
        }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) throw new Error(result.error);

      setLabel("");
      setStory("");
      setHref("");
      setFile(null);
      setDesignerName("");
      setLocation("");
      setBadge("");
      setFabric("");
      setOccasion("");
      setDescription("");
      setStyleTags("");
      setFeedLayout("");
      setIsEditorialBreak(false);
      setEditorialLabel("");
      setIsHero(false);
      setGalleryFiles(null);
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
        <label className="block text-sm mb-1">Chapter (category)</label>
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
        <p className="text-xs text-muted mt-1">Also used to match the Home filter chips (Wedding, Celebrity, etc.)</p>
      </div>

      <div>
        <label className="block text-sm mb-1">Extra filter tags (optional)</label>
        <input
          value={styleTags}
          onChange={(e) => setStyleTags(e.target.value)}
          placeholder="bridal, luxury"
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
        <p className="text-xs text-muted mt-1">Comma-separated. Use for filter chips that aren&apos;t a Chapter above.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Designer / Tailor</label>
          <input
            value={designerName}
            onChange={(e) => setDesignerName(e.target.value)}
            placeholder="e.g. Ola Wood"
            className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Location</label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lagos"
            className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Badge</label>
        <select
          value={badge}
          onChange={(e) => setBadge(e.target.value)}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        >
          {BADGES.map((b) => (
            <option key={b.value} value={b.value}>
              {b.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Fabric</label>
          <input
            value={fabric}
            onChange={(e) => setFabric(e.target.value)}
            placeholder="e.g. Silk Aso Oke"
            className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Occasion</label>
          <input
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g. Traditional Wedding"
            className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Description (shown on the detail page)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Story (optional, shown if no description)</label>
        <textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          rows={2}
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
        <p className="text-xs text-muted mt-1">Shows as &quot;Shop This Look&quot; on the detail page. Leave blank if this look isn&apos;t shoppable.</p>
      </div>

      <div>
        <label className="block text-sm mb-1">Feed layout (optional)</label>
        <select
          value={feedLayout}
          onChange={(e) => setFeedLayout(e.target.value)}
          className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
        >
          {FEED_LAYOUTS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is-editorial-break"
          type="checkbox"
          checked={isEditorialBreak}
          onChange={(e) => setIsEditorialBreak(e.target.checked)}
        />
        <label htmlFor="is-editorial-break" className="text-sm">This look starts a new editorial section</label>
      </div>
      {isEditorialBreak && (
        <div>
          <label className="block text-sm mb-1">Section title</label>
          <input
            value={editorialLabel}
            onChange={(e) => setEditorialLabel(e.target.value)}
            placeholder="e.g. Wedding Collection"
            className="w-full border border-ink/20 rounded px-3 py-2 bg-white"
          />
        </div>
      )}

      <div className="flex items-center gap-2">
        <input id="is-hero" type="checkbox" checked={isHero} onChange={(e) => setIsHero(e.target.checked)} />
        <label htmlFor="is-hero" className="text-sm">Use as the Home hero (replaces the current one)</label>
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

      <div>
        <label className="block text-sm mb-1">Additional gallery photos (optional)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setGalleryFiles(e.target.files)}
          className="text-sm"
        />
        <p className="text-xs text-muted mt-1">Shown on the detail page below the main image.</p>
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
