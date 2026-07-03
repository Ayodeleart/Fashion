"use client";

import { useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

type Step = "upload" | "crop" | "color" | "publish" | "done";

const STEP_LABELS: Record<Step, string> = {
  upload: "1. Upload",
  crop: "2. Generate mobile crop",
  color: "3. Extract dominant color",
  publish: "4. Publish",
  done: "Published",
};

const STEP_ORDER: Step[] = ["upload", "crop", "color", "publish", "done"];

export default function HeroUploadWorkflow() {
  const [step, setStep] = useState<Step>("upload");
  const [label, setLabel] = useState("");
  const [desktopFile, setDesktopFile] = useState<File | null>(null);
  const [desktopPreviewUrl, setDesktopPreviewUrl] = useState<string | null>(null);
  const [mobileBlob, setMobileBlob] = useState<Blob | null>(null);
  const [mobilePreviewUrl, setMobilePreviewUrl] = useState<string | null>(null);
  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const sourceVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setDesktopFile(file);
    setDesktopPreviewUrl(URL.createObjectURL(file));
    setError(null);
  }

  // Step 2: center-crop the desktop video to a 9:16 portrait clip entirely
  // client-side via canvas + MediaRecorder. No AI segmentation involved —
  // it's a straight center crop, matching the "no masking" requirement.
  async function generateMobileCrop() {
    const video = sourceVideoRef.current;
    if (!video || !desktopFile) return;
    setBusy(true);
    setError(null);

    try {
      await video.play().catch(() => {});
      video.pause();
      video.currentTime = 0;
      await new Promise((resolve) => (video.onloadeddata = resolve));

      const targetW = 720;
      const targetH = 1280; // 9:16
      const canvas = canvasRef.current ?? document.createElement("canvas");
      canvasRef.current = canvas;
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;

      // Center-crop math: scale video so it fills the portrait frame's
      // height, then crop equally from left/right.
      const videoRatio = video.videoWidth / video.videoHeight;
      const targetRatio = targetW / targetH;
      let drawW: number, drawH: number, offsetX: number, offsetY: number;

      if (videoRatio > targetRatio) {
        drawH = targetH;
        drawW = targetH * videoRatio;
        offsetX = (targetW - drawW) / 2;
        offsetY = 0;
      } else {
        drawW = targetW;
        drawH = targetW / videoRatio;
        offsetX = 0;
        offsetY = (targetH - drawH) / 2;
      }

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      const recordingDone = new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
      });

      recorder.start();
      await video.play();

      const drawFrame = () => {
        if (video.paused || video.ended) return;
        ctx.clearRect(0, 0, targetW, targetH);
        ctx.drawImage(video, offsetX, offsetY, drawW, drawH);
        requestAnimationFrame(drawFrame);
      };
      drawFrame();

      await new Promise((resolve) => {
        video.onended = resolve;
      });
      recorder.stop();

      const blob = await recordingDone;
      setMobileBlob(blob);
      setMobilePreviewUrl(URL.createObjectURL(blob));
      setStep("color");
    } catch (err) {
      console.error(err);
      setError(
        "Couldn't generate the mobile crop in-browser (MediaRecorder support varies by browser). You can also upload a pre-cropped portrait file manually — ask Claude to add that fallback if you hit this."
      );
    } finally {
      setBusy(false);
    }
  }

  // Step 3: sample the dominant color from the source video's first frame.
  function extractDominantColor() {
    const video = sourceVideoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0, 32, 32);
    const { data } = ctx.getImageData(0, 0, 32, 32);

    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
      count++;
    }
    r = Math.round(r / count);
    g = Math.round(g / count);
    b = Math.round(b / count);

    setDominantColor(`${r}, ${g}, ${b}`);
    setStep("publish");
  }

  // Step 4: upload both files to Supabase Storage, insert the hero_videos row.
  async function publish() {
    if (!desktopFile || !mobileBlob || !dominantColor || !label) {
      setError("Fill in a label and complete steps 2-3 first.");
      return;
    }
    setBusy(true);
    setError(null);

    try {
      const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

      const { error: deskErr } = await supabase.storage
        .from("hero-videos")
        .upload(`${slug}-desktop.mp4`, desktopFile, { upsert: true });
      if (deskErr) throw deskErr;

      const { error: mobErr } = await supabase.storage
        .from("hero-videos")
        .upload(`${slug}-mobile.webm`, mobileBlob, { upsert: true });
      if (mobErr) throw mobErr;

      const { data: deskUrl } = supabase.storage.from("hero-videos").getPublicUrl(`${slug}-desktop.mp4`);
      const { data: mobUrl } = supabase.storage.from("hero-videos").getPublicUrl(`${slug}-mobile.webm`);

      const { error: insertErr } = await supabase.from("hero_videos").insert({
        label,
        desktop_url: deskUrl.publicUrl,
        mobile_url: mobUrl.publicUrl,
        dominant_color: dominantColor,
        status: "published",
      });
      if (insertErr) throw insertErr;

      setStep("done");
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Publish failed — check Supabase Storage bucket 'hero-videos' exists and RLS allows this insert."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-2xl">
      {/* Stepper */}
      <div className="flex gap-2 mb-8 text-xs">
        {STEP_ORDER.map((s) => (
          <span
            key={s}
            className={`px-2.5 py-1 rounded-full border ${
              step === s
                ? "bg-ink text-paper border-ink"
                : "border-ink/20 text-muted"
            }`}
          >
            {STEP_LABELS[s]}
          </span>
        ))}
      </div>

      {error && (
        <div className="mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm mb-1">Label</label>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="e.g. Emerald Look — Orbit"
            className="w-full border border-ink/20 rounded px-3 py-2 text-sm bg-white"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Desktop video file</label>
          <input type="file" accept="video/*" onChange={handleFileChange} className="text-sm" />
        </div>

        {desktopPreviewUrl && (
          <video
            ref={sourceVideoRef}
            src={desktopPreviewUrl}
            muted
            playsInline
            className="w-full max-w-sm rounded border border-ink/10"
          />
        )}

        {desktopFile && step === "upload" && (
          <button
            onClick={() => setStep("crop")}
            className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
          >
            Continue to mobile crop
          </button>
        )}

        {step === "crop" && (
          <button
            disabled={busy}
            onClick={generateMobileCrop}
            className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors disabled:opacity-50"
          >
            {busy ? "Rendering crop…" : "Generate mobile crop"}
          </button>
        )}

        {mobilePreviewUrl && (
          <video
            src={mobilePreviewUrl}
            muted
            playsInline
            controls
            className="w-40 rounded border border-ink/10"
          />
        )}

        {step === "color" && (
          <button
            onClick={extractDominantColor}
            className="text-sm px-4 py-2 bg-ink text-paper rounded hover:bg-ink/90 transition-colors"
          >
            Extract dominant color
          </button>
        )}

        {dominantColor && (
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded border border-ink/10"
              style={{ backgroundColor: `rgb(${dominantColor})` }}
            />
            <span className="text-sm text-muted">rgb({dominantColor})</span>
          </div>
        )}

        {step === "publish" && (
          <button
            disabled={busy}
            onClick={publish}
            className="text-sm px-4 py-2 bg-brass text-ink rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? "Publishing…" : "Publish to storefront"}
          </button>
        )}

        {step === "done" && (
          <p className="text-sm text-green-700">
            Published. It'll appear in the hero rotation on next page load.
          </p>
        )}
      </div>
    </div>
  );
}
