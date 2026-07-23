"use client";

import { useEffect, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "live" | "countdown" | "captured" | "denied" | "unsupported";

const TIMER_OPTIONS = [3, 5, 10] as const;

export default function TimedCameraCapture({
  label,
  error: externalError,
  onConfirm,
  onCancel,
  onSkip,
  skipLabel,
}: {
  /** Short tag shown top-center, e.g. "Front" or "Side" — not a full instructions paragraph. */
  label: string;
  /** Error from the parent (e.g. "couldn't detect a full body") to surface over the camera. */
  error?: string | null;
  /** Called only when the user explicitly confirms with "Use Photo". */
  onConfirm: (dataUrl: string) => void;
  /** Renders an X button top-left that backs out of the camera entirely. */
  onCancel?: () => void;
  /** Renders a "Skip" text link at the bottom, only offered while live (not after a photo is captured). */
  onSkip?: () => void;
  skipLabel?: string;
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
  // camera opening straight into the live view. Runs every time this
  // component mounts, which is guaranteed to happen fresh for each capture
  // step because the parent gives it a distinct `key` (see MeasurementsFlow) —
  // without that key, React would reuse the same instance across steps and
  // this effect would never re-fire.
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
    // Deliberately NOT calling onConfirm here — the user reviews the photo
    // first and explicitly taps "Use Photo" or "Retake" below.
  }

  function retake() {
    setPreviewUrl(null);
    setSecondsLeft(null);
    startCamera(facingMode);
  }

  function usePhoto() {
    if (previewUrl) onConfirm(previewUrl);
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

      {/* Body-position guide: a plain standing silhouette, arms at the
          sides — not arms-spread, which doesn't fit a 9:16 portrait frame. */}
      {state === "live" && (
        <svg
          aria-hidden
          viewBox="0 0 200 400"
          className="absolute inset-x-0 pointer-events-none opacity-30"
          style={{ top: "8%", height: "78%", left: "50%", transform: "translateX(-50%)" }}
          preserveAspectRatio="xMidYMid meet"
          fill="none"
        >
          <ellipse cx="100" cy="35" rx="26" ry="32" stroke="#ffffff" strokeWidth={3} />
          <path
            d="M100 67 L100 210 M100 90 L72 205 M100 90 L128 205 M100 210 L78 392 M100 210 L122 392"
            stroke="#ffffff"
            strokeWidth={3}
            strokeLinecap="round"
          />
        </svg>
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

      {/* Bottom bar: timer pills + shutter, or Retake/Use Photo once captured — overlaid over the video, not pushed below it. */}
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
            {onSkip && (
              <button type="button" onClick={onSkip} className="text-white text-sm underline">
                {skipLabel ?? "Skip"}
              </button>
            )}
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
          <div className="flex items-center gap-3 w-full max-w-sm">
            <button
              type="button"
              onClick={retake}
              className="flex-1 h-12 rounded-full bg-black/45 text-white text-sm font-medium"
            >
              Retake
            </button>
            <button
              type="button"
              onClick={usePhoto}
              className="flex-1 h-12 rounded-full bg-white text-black text-sm font-semibold"
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
