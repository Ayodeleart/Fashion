"use client";

import { useState } from "react";
import { publishHeroLook } from "./hero-actions";

const COLOR_PRESETS = [
  { label: "Emerald", value: "22, 48, 42" },
  { label: "Coffee Brown", value: "74, 47, 31" },
  { label: "Ink Navy", value: "18, 26, 40" },
  { label: "Burnt Amber", value: "120, 66, 30" },
];

type Slot = "left" | "middle" | "right";

type SlotState = {
  file: File | null;
  processedBlob: Blob | null;
  previewUrl: string | null;
  processing: boolean;
};

const emptySlot: SlotState = { file: null, processedBlob: null, previewUrl: null, processing: false };

export default function HeroUploadWorkflow() {
  const [label, setLabel] = useState("");
  const [slots, setSlots] = useState<Record<Slot, SlotState>>({
    left: { ...emptySlot },
    middle: { ...emptySlot },
    right: { ...emptySlot },
  });
  const [bgColor, setBgColor] = useState(COLOR_PRESETS[0].value);
  const [customColor, setCustomColor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(slot: Slot, file: File) {
    setError(null);
    setSlots((s) => ({ ...s, [slot]: { file, processedBlob: null, previewUrl: URL.createObjectURL(file), processing: true } }));

    try {
      // Background removal runs entirely client-side (WASM/ONNX model
      // fetched from a CDN on first use) — no API key, no per-image cost.
      const { removeBackground } = await import("@imgly/background-removal");
      const resultBlob = await removeBackground(file);
      const url = URL.createObjectURL(resultBlob);
      setSlots((s) => ({ ...s, [slot]: { file, processedBlob: resultBlob, previewUrl: url, processing: false } }));
    } catch (err) {
      console.error(err);
      setError(
        `Background removal failed for the ${slot} image (first run downloads a ~40MB model — check your connection). You can still publish; that slot will keep its original background.`
      );
      setSlots((s) => ({
        ...s,
        [slot]: { ...s[slot], processedBlob: null, processing: false },
      }));
    }
  }

  function activeColor() {
    return customColor.trim() || bgColor;
  }

  async function publish() {
    if (!slots.middle.file) {
      setError("The middle image is required — it's the only one that shows on mobile.");
      return;
    }
    if (!label.trim()) {
      setError("Give this look a label.");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      const form = new FormData();
      form.set("label", label);
      form.set("bgColor", activeColor());

      (["left", "middle", "right"] as Slot[]).forEach((slot) => {
        const s = slots[slot];
        if (!s.file) return;
        const blob = s.processedBlob ?? s.file;
        const ext = s.processedBlob ? "png" : s.file.name.split(".").pop() || "png";
        form.set(slot, new File([blob], `${slot}.${ext}`, { type: s.processedBlob ? "image/png" : s.file.type }));
      });

      const result = await publishHeroLook(form);
      if (result.error) throw new Error(result.error);

      setDone(true);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="max-w-3xl">
      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</div>
      )}

      <div className="mb-6">
        <label className="block text-sm mb-1">Label</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. Coffee Brown — Autumn"
          className="w-full max-w-sm border border-ink/20 rounded px-3 py-2 text-sm bg-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SlotUpload title="Left (desktop only)" slot="left" state={slots.left} onFile={handleFile} />
        <SlotUpload title="Middle (required, shows on mobile)" slot="middle" state={slots.middle} onFile={handleFile} required />
        <SlotUpload title="Right (desktop only)" slot="right" state={slots.right} onFile={handleFile} />
      </div>

      <div className="mb-8">
        <label className="block text-sm mb-2">Hero background color</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => {
                setBgColor(preset.value);
                setCustomColor("");
              }}
              className={`flex items-center gap-2 text-sm px-3 py-2 rounded border transition-colors ${
                !customColor && bgColor === preset.value ? "border-ink" : "border-ink/15 hover:border-ink/40"
              }`}
            >
              <span
                className="w-4 h-4 rounded-full border border-black/10"
                style={{ backgroundColor: `rgb(${preset.value})` }}
              />
              {preset.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Custom RGB:</span>
          <input
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="e.g. 40, 30, 60"
            className="border border-ink/20 rounded px-2 py-1 text-xs bg-white w-40"
          />
          <span className="w-5 h-5 rounded-full border border-black/10" style={{ backgroundColor: `rgb(${activeColor()})` }} />
        </div>
      </div>

      {!done ? (
        <button
          disabled={publishing}
          onClick={publish}
          className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {publishing ? "Publishing…" : "Publish look"}
        </button>
      ) : (
        <p className="text-sm text-green-700">Published — it'll appear in the hero rotation on next page load.</p>
      )}
    </div>
  );
}

function SlotUpload({
  title,
  slot,
  state,
  onFile,
  required,
}: {
  title: string;
  slot: Slot;
  state: SlotState;
  onFile: (slot: Slot, file: File) => void;
  required?: boolean;
}) {
  return (
    <div>
      <p className="text-sm mb-2">
        {title} {required && <span className="text-brass">*</span>}
      </p>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(slot, file);
        }}
        className="text-xs mb-3"
      />
      {state.previewUrl && (
        <div className="relative w-full aspect-[3/4] bg-[repeating-conic-gradient(#ddd_0_25%,#fff_0_50%)] bg-[length:16px_16px] rounded overflow-hidden border border-ink/10">
          <img src={state.previewUrl} alt="" className="w-full h-full object-contain" />
          {state.processing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-xs">
              Removing background…
            </div>
          )}
        </div>
      )}
    </div>
  );
}
