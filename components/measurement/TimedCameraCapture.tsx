"use client";

import { useEffect, useRef, useState } from "react";

type CameraState = "idle" | "requesting" | "live" | "countdown" | "captured" | "denied" | "unsupported";

const TIMER_OPTIONS = [3, 5, 10] as const;

export default function TimedCameraCapture({
  title,
  instructions,
  onCapture,
  onRetakeStart,
}: {
  title: string;
  instructions: string;
  onCapture: (dataUrl: string) => void;
  /** Called when the user starts a fresh capture after already having one — lets the parent clear its own captured state. */
  onRetakeStart?: () => void;
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
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
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
        setError("Couldn't start the camera. You can upload a photo instead.");
        setState("unsupported");
      }
    }
  }

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
    onCapture(dataUrl);
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
      onCapture(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted mt-0.5">{instructions}</p>
      </div>

      <div className="relative w-full aspect-[9/16] rounded-2xl overflow-hidden bg-ink/90 flex items-center justify-center">
        {state === "captured" && previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Captured" className="w-full h-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover ${facingMode === "user" ? "[transform:scaleX(-1)]" : ""} ${
              state === "live" || state === "countdown" ? "block" : "hidden"
            }`}
          />
        )}

        {(state === "live" || state === "countdown") && (
          <button
            type="button"
            onClick={flipCamera}
            aria-label="Flip camera"
            className="absolute top-3 right-3 h-9 pl-2.5 pr-3 rounded-full bg-black/45 flex items-center gap-1.5"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M17 2.5 20 5.5 17 8.5"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M20 5.5H8a5.5 5.5 0 0 0-5.5 5.5v1"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
              <path
                d="M7 21.5 4 18.5 7 15.5"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M4 18.5h12a5.5 5.5 0 0 0 5.5-5.5v-1"
                stroke="#ffffff"
                strokeWidth={1.8}
                strokeLinecap="round"
              />
            </svg>
            <span className="text-white text-xs font-medium">Flip</span>
          </button>
        )}

        {state === "idle" && (
          <button
            type="button"
            onClick={() => startCamera()}
            className="px-5 py-2.5 rounded-full bg-paper text-ink text-sm font-medium"
          >
            Enable Camera
          </button>
        )}

        {state === "requesting" && <p className="text-paper text-sm">Requesting camera access…</p>}

        {(state === "denied" || state === "unsupported") && (
          <div className="text-center px-6">
            <p className="text-paper text-sm mb-3">
              {state === "denied"
                ? "Camera access was denied. You can allow it in your browser settings, or upload a photo instead."
                : "Camera isn't available here — upload a photo instead."}
            </p>
            <label className="inline-block px-5 py-2.5 rounded-full bg-paper text-ink text-sm font-medium cursor-pointer">
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

      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {state === "live" && (
        <>
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs text-muted mr-1">Timer</span>
            {TIMER_OPTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSeconds(s)}
                className={`w-11 h-9 rounded-full text-xs font-medium ${
                  seconds === s ? "bg-ink text-paper" : "bg-paper-raised text-ink"
                }`}
              >
                {s}s
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={beginCountdown}
            className="w-full h-12 rounded-full bg-ink text-paper text-sm font-semibold"
          >
            Start {seconds}s Timer
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
          className="w-full h-12 rounded-full border border-ink/15 text-sm font-medium"
        >
          Cancel
        </button>
      )}

      {state === "captured" && (
        <button type="button" onClick={retake} className="w-full h-12 rounded-full border border-ink/15 text-sm font-medium">
          Retake
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
