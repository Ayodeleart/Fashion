"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { estimateMeasurements, type EstimatedMeasurements, type PoseLandmark } from "@/lib/poseMeasurements";
import TimedCameraCapture from "@/components/measurement/TimedCameraCapture";

type Step = "intro" | "capture-front" | "processing" | "capture-side" | "review" | "saved";

const FIELD_LABELS: Record<keyof EstimatedMeasurements, string> = {
  shoulderCm: "Shoulder width",
  chestCm: "Chest",
  waistCm: "Waist",
  hipCm: "Hip",
  armLengthCm: "Arm length",
  inseamCm: "Inseam",
};

// Only these two are direct pixel-distance measurements (high confidence).
// Everything else is a circumference estimate from a 2D front photo — the
// review screen labels them differently so the customer knows which
// numbers to trust more and which to double-check.
const HIGH_CONFIDENCE_FIELDS = new Set<keyof EstimatedMeasurements>(["shoulderCm", "armLengthCm"]);

export default function MeasurementsFlow() {
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState<Step>("intro");
  const [heightCm, setHeightCm] = useState("170");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sideImageUrl, setSideImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<EstimatedMeasurements | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleFrontCapture(dataUrl: string) {
    setError(null);
    setImageUrl(dataUrl);
    setStep("processing");

    try {
      const img = await loadImage(dataUrl);
      const landmarks = await detectPose(img);
      if (!landmarks) {
        setError("Couldn't get a clear read on that photo — stand facing the camera, full body in frame, arms slightly away from your sides, then try again.");
        setStep("capture-front");
        return;
      }
      const h = parseFloat(heightCm);
      const anklesVisible =
        (landmarks[27]?.visibility ?? 1) >= 0.4 && (landmarks[28]?.visibility ?? 1) >= 0.4;
      if (!anklesVisible) {
        setError("Your feet weren't fully visible — step further back from the camera so your whole body, ankles included, fits in frame, then try again.");
        setStep("capture-front");
        return;
      }
      const result = estimateMeasurements(landmarks, h, img.naturalWidth, img.naturalHeight);
      if (!result) {
        setError("Couldn't estimate from that photo — try again with better lighting and your full body visible.");
        setStep("capture-front");
        return;
      }
      setValues(result);
      setStep("capture-side");
    } catch {
      setError("Something went wrong analyzing that photo. Try again.");
      setStep("capture-front");
    }
  }

  async function handleSave() {
    if (!values) return;
    setSaving(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
        return;
      }
      const { error: dbError } = await supabase.from("ariana_customer_measurements").upsert(
        {
          user_id: data.user.id,
          height_cm: parseFloat(heightCm),
          shoulder_cm: values.shoulderCm,
          chest_cm: values.chestCm,
          waist_cm: values.waistCm,
          hip_cm: values.hipCm,
          arm_length_cm: values.armLengthCm,
          inseam_cm: values.inseamCm,
          source: "photo_estimate",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );
      if (dbError) throw new Error(dbError.message);
      setStep("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save — try again.");
    } finally {
      setSaving(false);
    }
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted">
          Two things: your height, and one full-body photo facing the camera
          (plain background, arms slightly away from your sides). We estimate
          your measurements from that — no tape measure needed. You&apos;ll get a
          chance to fine-tune every number before it&apos;s saved.
        </p>
        <label className="text-sm font-medium">Height (cm)</label>
        <input
          type="number"
          value={heightCm}
          onChange={(e) => setHeightCm(e.target.value)}
          className="bg-paper-raised rounded-full px-4 py-3 text-sm outline-none"
        />
        <button
          onClick={() => setStep("capture-front")}
          disabled={!heightCm || parseFloat(heightCm) <= 0}
          className="bg-ink text-paper rounded-full py-3 text-sm font-medium disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    );
  }

  if (step === "capture-front") {
    return (
      <div className="flex flex-col gap-4">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <TimedCameraCapture
          title="Front photo"
          instructions="Stand facing the camera, far enough back that your feet are fully visible in frame, plain background if possible. Pick a timer, then step into position — it captures automatically."
          onCapture={handleFrontCapture}
        />
      </div>
    );
  }

  if (step === "capture-side") {
    return (
      <div className="flex flex-col gap-4">
        <TimedCameraCapture
          title="Side photo (optional)"
          instructions="Turn 90° so your side faces the camera. This helps with future accuracy improvements — you can skip it and use the front photo alone."
          onCapture={(dataUrl) => {
            setSideImageUrl(dataUrl);
            setStep("review");
          }}
        />
        <button onClick={() => setStep("review")} className="text-sm text-muted underline">
          Skip this step
        </button>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex flex-col items-center gap-4 py-10">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="w-32 rounded-2xl opacity-60" />
        )}
        <p className="text-sm text-muted">Reading your photo…</p>
      </div>
    );
  }

  if (step === "review" && values) {
    return (
      <div className="flex flex-col gap-5">
        <p className="text-xs text-muted">
          These are estimates. Adjust anything that doesn&apos;t feel right —
          especially chest, waist, and hip, which are the least certain from
          a single photo{sideImageUrl ? ", though your side photo is on file for future accuracy improvements" : ""}.
        </p>
        {(Object.keys(values) as (keyof EstimatedMeasurements)[]).map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {FIELD_LABELS[key]}
                {!HIGH_CONFIDENCE_FIELDS.has(key) && <span className="text-muted"> · estimate</span>}
              </span>
              <span className="text-muted">{values[key]} cm</span>
            </div>
            <input
              type="range"
              min={(values[key] * 0.8).toFixed(1)}
              max={(values[key] * 1.2).toFixed(1)}
              step={0.5}
              value={values[key]}
              onChange={(e) => setValues({ ...values, [key]: parseFloat(e.target.value) })}
              className="w-full accent-brass"
            />
          </div>
        ))}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-ink text-paper rounded-full py-3 text-sm font-medium disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save measurements"}
        </button>
        <button
          onClick={() => {
            setImageUrl(null);
            setSideImageUrl(null);
            setStep("capture-front");
          }}
          className="text-sm text-muted underline"
        >
          Retake photo
        </button>
      </div>
    );
  }

  if (step === "saved") {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm">Saved. These will be used automatically at checkout for made-to-order pieces.</p>
        <button onClick={() => router.push("/catalog")} className="bg-ink text-paper rounded-full py-3 text-sm font-medium">
          Back to shop
        </button>
      </div>
    );
  }

  return null;
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// Loaded once per page session (module-level cache), since the wasm +
// model download is the slow part — no reason to redo it on a retake.
let landmarkerPromise: Promise<import("@mediapipe/tasks-vision").PoseLandmarker> | null = null;

async function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, PoseLandmarker } = await import("@mediapipe/tasks-vision");
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm"
      );
      return PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        },
        runningMode: "IMAGE",
        numPoses: 1,
      });
    })();
  }
  return landmarkerPromise;
}

async function detectPose(img: HTMLImageElement): Promise<PoseLandmark[] | null> {
  const landmarker = await getLandmarker();
  const result = landmarker.detect(img);
  return result.landmarks?.[0] ?? null;
}
