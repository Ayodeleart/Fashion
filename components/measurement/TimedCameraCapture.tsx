"use client";

import { useEffect, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "live" | "countdown" | "captured" | "denied" | "unsupported";

const TIMER_OPTIONS = [3, 5, 10] as const;

export default function TimedCameraCapture({
  label,
  guideHint,
  pose = "front",
  error: externalError,
  onConfirm,
  onRetakeStart,
  onCancel,
}: {
  /** Short tag shown top-center, e.g. "Front" or "Side" — not a full instructions paragraph. */
  label: string;
  /** One-line instruction shown under the position guide, e.g. "Face the camera, arms slightly out". */
  guideHint?: string;
  /** Which body-position overlay to draw — front (facing camera) or side (profile). */
  pose?: "front" | "side";
  /** Error from the parent (e.g. "couldn't detect a full body") to surface over the camera. */
  error?: string | null;
  /** Called only once the user taps "Use Photo" on the review screen — the confirmed shot to send onward. */
  onConfirm: (dataUrl: string) => void;
  /** Called when the user starts a fresh capture after already having one — lets the parent clear its own captured state. */
  onRetakeStart?: () => void;
  /** Renders an X button top-left that backs out of the camera entirely. */
  onCancel?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [state, setState] = useState<CameraState>("idle");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [seconds, setSeconds] = useState<3 | 5 | 10>(5);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const error = externalError ?? cameraError;

  useEffect(() => {
    return () => {
      stopStream();
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  function stopStream() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function startCamera(mode: "user" | "environment" = facingMode) {
    setCameraError(null);
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("unsupported");
      return;
    }
    setState("requesting");
    stopStream();
    try {
      // Deliberately loose: only facingMode + a soft width hint. Locking
      // both width AND height (or adding an explicit aspectRatio) made
      // iOS Safari pick a tightly-cropped, heavily zoomed-in sensor mode
      // to satisfy the exact numbers instead of its normal full-FOV feed.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setFacingMode(mode);
      setState("live");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setState("denied");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setState("unsupported");
      } else {
        setCameraError("Couldn't start the camera. You can upload a photo instead.");
        setState("unsupported");
      }
    }
  }

  // Auto-start on mount — no "Enable Camera" tap needed, matches a native
  // camera opening straight into the live view.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flipCamera() {
    startCamera(facingMode === "user" ? "environment" : "user");
  }

  function beginCountdown() {
    if (state !== "live") return;
    setState("countdown");
    setSecondsLeft(seconds);
    countdownRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          capture();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function capture() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (facingMode === "user") {
      // Mirror horizontally so the saved photo matches what the user saw
      // in the front-camera preview, not a flipped version of themselves.
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopStream();
    setPreviewUrl(dataUrl);
    setState("captured");
  }

  function confirmPhoto() {
    if (!previewUrl) return;
    onConfirm(previewUrl);
  }

  function retake() {
    onRetakeStart?.();
    setPreviewUrl(null);
    setSecondsLeft(null);
    startCamera(facingMode);
  }

  async function handleFileFallback(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewUrl(dataUrl);
      setState("captured");
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {state === "captured" && previewUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={previewUrl} alt="Captured" className="absolute inset-0 w-full h-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            facingMode === "user" ? "[transform:scaleX(-1)]" : ""
          } ${state === "live" || state === "countdown" ? "block" : "hidden"}`}
        />
      )}

      {(state === "live" || state === "countdown") && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg viewBox="0 0 200 400" className="h-[78%] opacity-50" fill="none">
            {pose === "front" ? (
              <path
                d="M100 18 a17 17 0 1 1 -0.1 0 M75 55 q25 -12 50 0 l10 60 -8 4 q-6 60 2 110 l6 90 -16 4 -8 -95 -11 0 -8 95 -16 -4 6 -90 q10 -50 2 -110 l-8 -4 Z"
                stroke="#ffffff"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeDasharray="6 5"
              />
            ) : (
              <path
                d="M108 20 a16 16 0 1 1 -0.1 0 M96 52 q18 -6 26 4 l6 55 q10 12 6 40 l10 100 -14 5 -10 -85 -6 0 2 88 -14 3 -6 -105 q-8 -30 0 -60 Z"
                stroke="#ffffff"
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeDasharray="6 5"
              />
            )}
          </svg>
        </div>
      )}

      {(state === "live" || state === "countdown") && (
        <div
          className="absolute inset-x-0 flex justify-center px-6"
          style={{ top: "calc(env(safe-area-inset-top) + 56px)" }}
        >
          <p className="text-xs text-white bg-black/45 rounded-full px-3 py-1.5 text-center">
            {guideHint ?? (pose === "front" ? "Face the camera, arms slightly away from your sides" : "Turn 90°, stand in profile, arms relaxed")}
          </p>
        </div>
      )}

      {/* Top bar: cancel, short label, flip — overlaid, doesn't push the video down. */}
      <div
        className="absolute top-0 inset-x-0 flex items-center justify-between px-4 pb-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 12px)" }}
      >
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            aria-label="Cancel"
            className="w-9 h-9 rounded-full bg-black/45 flex items-center justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M6 6l12 12M18 6 6 18" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <span />
        )}

        <span className="text-white text-xs font-medium bg-black/45 px-3 py-1.5 rounded-full">{label}</span>

        {state === "live" || state === "countdown" ? (
          <button
            type="button"
            onClick={flipCamera}
            aria-label="Flip camera"
            className="h-9 pl-2.5 pr-3 rounded-full bg-black/45 flex items-center gap-1.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M17 2.5 20 5.5 17 8.5" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 5.5H8a5.5 5.5 0 0 0-5.5 5.5v1" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
              <path d="M7 21.5 4 18.5 7 15.5" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
              <path d="M4 18.5h12a5.5 5.5 0 0 0 5.5-5.5v-1" stroke="#ffffff" strokeWidth={1.8} strokeLinecap="round" />
            </svg>
            <span className="text-white text-xs font-medium">Flip</span>
          </button>
        ) : (
          <span className="w-9" />
        )}
      </div>

      {error && (
        <div
          className="absolute inset-x-4 flex justify-center"
          style={{ top: "calc(env(safe-area-inset-top) + 56px)" }}
        >
          <p className="text-xs text-white bg-red-600/90 rounded-xl px-3 py-2 text-center max-w-sm">{error}</p>
        </div>
      )}

      {state === "requesting" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-white text-sm">Requesting camera access…</p>
        </div>
      )}

      {(state === "denied" || state === "unsupported") && (
        <div className="absolute inset-0 flex items-center justify-center px-8">
          <div className="text-center">
            <p className="text-white text-sm mb-4">
              {state === "denied"
                ? "Camera access was denied. Allow it in your browser settings, or upload a photo instead."
                : "Camera isn't available here — upload a photo instead."}
            </p>
            <label className="inline-block px-5 py-2.5 rounded-full bg-white text-black text-sm font-medium cursor-pointer">
              Upload Photo
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="user"
                onChange={handleFileFallback}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {state === "countdown" && secondsLeft !== null && secondsLeft > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <span
            className="font-display text-8xl leading-none"
            style={{ color: "#ffffff", fontWeight: 800, textShadow: "0 2px 12px rgba(0,0,0,0.65)" }}
          >
            {secondsLeft}
          </span>
        </div>
      )}

      {/* Bottom bar: timer pills + shutter — overlaid over the video, not pushed below it. */}
      <div
        className="absolute bottom-0 inset-x-0 flex flex-col items-center gap-4 px-5"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 20px)", paddingTop: "24px" }}
      >
        {state === "live" && (
          <>
            <div className="flex items-center gap-2">
              {TIMER_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSeconds(s)}
                  className={`w-12 h-9 rounded-full text-xs font-semibold ${
                    seconds === s ? "bg-white text-black" : "bg-black/45 text-white"
                  }`}
                >
                  {s}s
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={beginCountdown}
              aria-label={`Start ${seconds}s timer`}
              className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center"
            >
              <span className="w-16 h-16 rounded-full bg-white" />
            </button>
          </>
        )}

        {state === "countdown" && (
          <button
            type="button"
            onClick={() => {
              if (countdownRef.current) clearInterval(countdownRef.current);
              setState("live");
              setSecondsLeft(null);
            }}
            className="h-11 px-6 rounded-full bg-black/45 text-white text-sm font-medium"
          >
            Cancel
          </button>
        )}

        {state === "captured" && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={retake}
              className="h-11 px-6 rounded-full bg-black/45 text-white text-sm font-medium"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={confirmPhoto}
              className="h-11 px-6 rounded-full bg-white text-black text-sm font-semibold"
            >
              Use Photo
            </button>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
