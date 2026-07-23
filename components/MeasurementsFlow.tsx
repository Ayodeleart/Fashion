"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import TimedCameraCapture from "@/components/measurement/TimedCameraCapture";

type Step = "intro" | "capture-front" | "capture-side" | "processing" | "review" | "saved";

type Measurements = {
  shoulderCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  armLengthCm: number;
  inseamCm: number;
};

const FIELD_LABELS: Record<keyof Measurements, string> = {
  shoulderCm: "Shoulder width",
  chestCm: "Chest",
  waistCm: "Waist",
  hipCm: "Hip",
  armLengthCm: "Arm length",
  inseamCm: "Inseam",
};

// Only these two are direct pixel-distance measurements (high confidence).
// Everything else is a circumference estimate — the review screen labels
// them differently so the customer knows which numbers to trust more and
// which to double-check.
const HIGH_CONFIDENCE_FIELDS = new Set<keyof Measurements>(["shoulderCm", "armLengthCm"]);

const PROCESSING_MESSAGES = [
  "Analyzing your measurements…",
  "Checking body proportions…",
  "Calculating your fit…",
];

function cmToDisplay(cm: number, unit: "cm" | "in") {
  return unit === "cm" ? `${cm} cm` : `${(cm / 2.54).toFixed(1)} in`;
}

export default function MeasurementsFlow() {
  const router = useRouter();
  const pathname = usePathname();

  const [step, setStep] = useState<Step>("intro");
  const [heightCm, setHeightCm] = useState("170");
  const [unit, setUnit] = useState<"cm" | "in">("cm");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [sideImageUrl, setSideImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<Measurements | null>(null);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [notes, setNotes] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [processingMessage, setProcessingMessage] = useState(PROCESSING_MESSAGES[0]);

  // Cycles the processing-screen copy while the AI call is in flight.
  useEffect(() => {
    if (step !== "processing") return;
    let i = 0;
    const id = setInterval(() => {
      i = (i + 1) % PROCESSING_MESSAGES.length;
      setProcessingMessage(PROCESSING_MESSAGES[i]);
    }, 1600);
    return () => clearInterval(id);
  }, [step]);

  async function handleAnalyze(frontUrl: string, sideUrl: string | null) {
    setProcessingMessage(PROCESSING_MESSAGES[0]);
    setStep("processing");
    setError(null);
    try {
      const res = await fetch("/api/ai/measure", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImage: frontUrl,
          sideImage: sideUrl,
          heightCm: parseFloat(heightCm) || 0,
        }),
      });

      let data: {
        measurements?: Measurements;
        anatomicalPass?: boolean;
        developerNotes?: string;
        confidenceScore?: number | null;
        error?: string;
      } = {};
      try {
        data = await res.json();
      } catch {
        throw new Error("Received an unexpected response — please try again.");
      }

      if (!res.ok || data.error) throw new Error(data.error || "Something went wrong analyzing those photos.");

      if (!data.anatomicalPass || !data.measurements) {
        // We can't attribute the rejection to one specific photo — the AI
        // evaluates both together — so both are cleared and the user
        // retakes front (then side) again, with the model's own reason
        // for the rejection shown up front.
        setImageUrl(null);
        setSideImageUrl(null);
        setError(data.developerNotes || "Couldn't get reliable measurements from those photos — try again with better lighting and your full body in frame.");
        setStep("capture-front");
        return;
      }

      setValues(data.measurements);
      setConfidence(typeof data.confidenceScore === "number" ? data.confidenceScore : null);
      setNotes(data.developerNotes ?? null);
      setStep("review");
    } catch (err) {
      const isNetworkError = err instanceof TypeError;
      setImageUrl(null);
      setSideImageUrl(null);
      setError(
        isNetworkError
          ? "Couldn't reach the server — check your connection and try again."
          : err instanceof Error
          ? err.message
          : "Something went wrong analyzing those photos."
      );
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
          Three things make this accurate: your height, a front photo, and a
          side photo — all facing the camera, plain background if possible,
          arms slightly away from your sides. We estimate your measurements
          from those — no tape measure needed. You&apos;ll get a chance to
          fine-tune every number before it&apos;s saved.
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
      <TimedCameraCapture
        // Distinct key from the side-capture step below is required — without
        // it React reuses the same component instance across steps instead of
        // mounting a fresh one, so its internal state (and the camera-start
        // effect) never resets. That was the root cause of the flow getting
        // stuck after the first photo.
        key="front-capture"
        label="Front"
        error={error}
        onConfirm={(dataUrl) => {
          setError(null);
          setImageUrl(dataUrl);
          setStep("capture-side");
        }}
        onCancel={() => setStep("intro")}
      />
    );
  }

  if (step === "capture-side") {
    return (
      <TimedCameraCapture
        key="side-capture"
        label="Side"
        onConfirm={(dataUrl) => {
          setSideImageUrl(dataUrl);
          if (imageUrl) handleAnalyze(imageUrl, dataUrl);
        }}
        onCancel={() => setStep("capture-front")}
        onSkip={() => {
          if (imageUrl) handleAnalyze(imageUrl, null);
        }}
        skipLabel="Skip side photo"
      />
    );
  }

  if (step === "processing") {
    return (
      <div className="fixed inset-0 z-50 bg-ink flex flex-col items-center justify-center gap-4 px-8">
        <div className="w-10 h-10 rounded-full border-2 border-brass border-t-transparent animate-spin" />
        <p className="text-paper text-sm text-center">{processingMessage}</p>
      </div>
    );
  }

  if (step === "review" && values) {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted flex-1 pr-3">
            These are estimates. Adjust anything that doesn&apos;t feel right —
            especially chest, waist, and hip, which are the least certain from
            a photo{sideImageUrl ? " pair" : ""}.
          </p>
          <div className="flex shrink-0 rounded-full bg-paper-raised p-0.5">
            <button
              type="button"
              onClick={() => setUnit("cm")}
              className={`px-3 py-1 rounded-full text-xs font-medium ${unit === "cm" ? "bg-ink text-paper" : "text-ink"}`}
            >
              cm
            </button>
            <button
              type="button"
              onClick={() => setUnit("in")}
              className={`px-3 py-1 rounded-full text-xs font-medium ${unit === "in" ? "bg-ink text-paper" : "text-ink"}`}
            >
              in
            </button>
          </div>
        </div>

        {confidence !== null && confidence < 0.5 && (
          <p className="text-xs text-red-600 bg-red-600/10 rounded-lg px-3 py-2">
            Low confidence on this read{!sideImageUrl ? " (no side photo was provided)" : ""} — worth double-checking these against your own measurements.
            {notes ? ` ${notes}` : ""}
          </p>
        )}

        {(Object.keys(values) as (keyof Measurements)[]).map((key) => (
          <div key={key} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {FIELD_LABELS[key]}
                {!HIGH_CONFIDENCE_FIELDS.has(key) && <span className="text-muted"> · estimate</span>}
              </span>
              <span className="text-muted">{cmToDisplay(values[key], unit)}</span>
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
          Retake photos
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
