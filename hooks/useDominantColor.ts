"use client";

import { useCallback, useRef } from "react";

/**
 * Samples the current frame of a <video> element via an offscreen canvas
 * and returns an approximate dominant color as an "r, g, b" string.
 * Used to drive --hero-live so the hero background matches whichever
 * clip is currently playing.
 *
 * This runs client-side only and needs no external service — same logic
 * the admin hero-upload workflow reuses to pre-compute a color at publish time.
 */
export function useDominantColor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const sample = useCallback((video: HTMLVideoElement): string | null => {
    if (video.readyState < 2) return null; // not enough data yet

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
    }
    const canvas = canvasRef.current;
    // Small sample size — we only need an average, not fidelity.
    const w = (canvas.width = 32);
    const h = (canvas.height = 32);

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;

    try {
      ctx.drawImage(video, 0, 0, w, h);
      const { data } = ctx.getImageData(0, 0, w, h);

      let r = 0,
        g = 0,
        b = 0,
        count = 0;

      for (let i = 0; i < data.length; i += 4) {
        // Skip near-transparent / near-white blown-out pixels for a
        // slightly richer average (studio backgrounds tend to dominate).
        const alpha = data[i + 3];
        if (alpha < 200) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      if (count === 0) return null;
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      return `${r}, ${g}, ${b}`;
    } catch {
      // Canvas can throw a SecurityError if the video source isn't
      // same-origin/CORS-cleared. Falls back to the static hero color.
      return null;
    }
  }, []);

  return sample;
}
