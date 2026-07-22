"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TryOnPicker, { type PickerTarget } from "@/components/TryOnPicker";

type Target = { name: string; image: string; href: string } | null;

type Step = "upload" | "ready" | "generating" | "result" | "error";

const MAX_DIMENSION = 1600;

// Downscales + re-encodes to a JPEG data URI so large phone-camera
// photos (often 8-12MB) don't blow past request-body limits.
function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that photo."));
    reader.onload = () => {
      const img = document.createElement("img");
      img.onerror = () => reject(new Error("That file doesn't look like a photo."));
      img.onload = () => {
        const scale = Math.min(1, MAX_DIMENSION / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Couldn't process that photo."));
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function TryOnFlow({ target: initialTarget }: { target: Target }) {
  const [pickedTarget, setPickedTarget] = useState<PickerTarget | null>(null);
  const [pickerOpen, setPickerOpen] = useState(!initialTarget);
  const target = pickedTarget ?? initialTarget;
  const [step, setStep] = useState<Step>("upload");
  const [photo, setPhoto] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo file.");
      return;
    }
    setError(null);
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPhoto(dataUrl);
      setStep("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't use that photo — try another.");
    }
  }

  async function handleGenerate() {
    if (!photo || !target) return;
    setStep("generating");
    setError(null);
    try {
      const res = await fetch("/api/ai/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personImage: photo, productImageUrl: target.image, productName: target.name }),
      });

      let data: { resultUrl?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Received an unexpected response from the server — please try again.");
      }

      if (!res.ok || !data.resultUrl) {
        throw new Error(data.error || "Something went wrong generating that look.");
      }
      setResultUrl(data.resultUrl);
      setStep("result");
    } catch (err) {
      const isNetworkError = err instanceof TypeError;
      setError(
        isNetworkError
          ? "Couldn't reach the server — check your connection and try again."
          : err instanceof Error
          ? err.message
          : "Couldn't generate that look. Try a clearer, well-lit full-body photo."
      );
      setStep("error");
    }
  }

  function reset() {
    setPhoto(null);
    setResultUrl(null);
    setError(null);
    setStep("upload");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  if (pickerOpen || !target) {
    return (
      <div className="flex flex-col gap-3">
        <TryOnPicker
          onPick={(t) => {
            setPickedTarget(t);
            setPickerOpen(false);
          }}
        />
        {target && (
          <button type="button" onClick={() => setPickerOpen(false)} className="text-xs text-muted underline self-center">
            Cancel
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3 rounded-2xl border border-ink/10 p-3">
        <div className="relative w-14 h-18 rounded-lg overflow-hidden bg-paper-raised shrink-0">
          <Image src={target.image} alt={target.name} fill className="object-cover" sizes="56px" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted">Trying on</p>
          <p className="text-sm font-medium truncate">{target.name}</p>
        </div>
        <button type="button" onClick={() => setPickerOpen(true)} className="text-xs text-muted underline shrink-0">
          Change
        </button>
      </div>

      {(step === "upload" || step === "ready") && (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl border border-dashed border-ink/20 aspect-[3/4] flex items-center justify-center overflow-hidden bg-paper-raised">
            {photo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo} alt="Your photo" className="w-full h-full object-cover" />
            ) : (
              <p className="text-sm text-muted text-center px-8">
                Upload or take one clear, well-lit, full-body photo — facing the camera, nothing cropped off.
              </p>
            )}
          </div>

          {error && <p className="text-xs text-red-600">{error}</p>}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFile}
            className="hidden"
            id="tryon-photo-input"
          />
          <label
            htmlFor="tryon-photo-input"
            className="w-full h-12 rounded-full border border-ink/15 flex items-center justify-center text-sm font-medium cursor-pointer"
          >
            {photo ? "Retake / Choose Another Photo" : "Upload or Take Photo"}
          </label>

          {step === "ready" && (
            <button
              type="button"
              onClick={handleGenerate}
              className="w-full h-12 rounded-full bg-ink text-paper text-sm font-semibold"
            >
              Generate My Look
            </button>
          )}
        </div>
      )}

      {step === "generating" && (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="w-10 h-10 rounded-full border-2 border-brass border-t-transparent animate-spin" />
          <p className="text-sm text-muted">Styling your look — this can take a moment…</p>
        </div>
      )}

      {step === "result" && resultUrl && (
        <div className="flex flex-col gap-4">
          <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-paper-raised">
            {/* Generated image is a fal.ai-hosted URL, not a local/Next asset. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={resultUrl} alt={`You wearing ${target.name}`} className="w-full h-full object-cover" />
          </div>
          <div className="flex gap-2.5">
            <a
              href={resultUrl}
              download={`tryon-${target.name.replace(/\s+/g, "-").toLowerCase()}.jpg`}
              className="flex-1 h-12 rounded-full border border-ink/15 flex items-center justify-center text-sm font-medium"
            >
              Save
            </a>
            <button
              type="button"
              onClick={reset}
              className="flex-1 h-12 rounded-full border border-ink/15 flex items-center justify-center text-sm font-medium"
            >
              Try Another
            </button>
          </div>
          <Link
            href={target.href}
            className="w-full h-12 rounded-full bg-ink text-paper text-sm font-semibold flex items-center justify-center"
          >
            Shop This Look
          </Link>
        </div>
      )}

      {step === "error" && (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={() => setStep("ready")}
            className="w-full h-12 rounded-full bg-ink text-paper text-sm font-semibold"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}
