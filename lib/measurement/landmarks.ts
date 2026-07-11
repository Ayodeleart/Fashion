import type { Landmark } from "./types";

// BlazePose's 33-point topology (MediaPipe Pose). Centralized here so
// every other module refers to a name, never a magic number.
export const LM = {
  NOSE: 0,
  LEFT_EYE: 2,
  RIGHT_EYE: 5,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
} as const;

export const CORE_LANDMARKS = [
  LM.NOSE,
  LM.LEFT_SHOULDER,
  LM.RIGHT_SHOULDER,
  LM.LEFT_ELBOW,
  LM.RIGHT_ELBOW,
  LM.LEFT_WRIST,
  LM.RIGHT_WRIST,
  LM.LEFT_HIP,
  LM.RIGHT_HIP,
  LM.LEFT_KNEE,
  LM.RIGHT_KNEE,
  LM.LEFT_ANKLE,
  LM.RIGHT_ANKLE,
];

export type PxPoint = { x: number; y: number };

/** Converts a normalized (0-1) landmark to pixel space for one image. */
export function toPx(lm: Landmark, imgWidth: number, imgHeight: number): PxPoint {
  return { x: lm.x * imgWidth, y: lm.y * imgHeight };
}

export function pxDistance(a: PxPoint, b: PxPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function landmarkDistancePx(
  landmarks: Landmark[],
  i: number,
  j: number,
  imgWidth: number,
  imgHeight: number
): number | null {
  const a = landmarks[i];
  const b = landmarks[j];
  if (!a || !b) return null;
  return pxDistance(toPx(a, imgWidth, imgHeight), toPx(b, imgWidth, imgHeight));
}

export function visibility(landmarks: Landmark[], i: number): number {
  return landmarks[i]?.visibility ?? 0;
}

export function midpointPx(a: Landmark, b: Landmark, imgWidth: number, imgHeight: number): PxPoint {
  const pa = toPx(a, imgWidth, imgHeight);
  const pb = toPx(b, imgWidth, imgHeight);
  return { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
}

/**
 * Torso-normalized coordinates: every landmark expressed as a multiple of
 * shoulder width, with the mid-shoulder point as the origin. This makes
 * body-shape ratios comparable across photos of different resolution,
 * camera distance, and framing — you can't compare raw pixel distances
 * between two different photos, but you can compare torso-relative ones.
 */
export function normalizeToTorso(
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number
): Map<number, PxPoint> | null {
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  if (!ls || !rs) return null;

  const shoulderWidth = landmarkDistancePx(landmarks, LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, imgWidth, imgHeight);
  if (!shoulderWidth || shoulderWidth <= 0) return null;

  const origin = midpointPx(ls, rs, imgWidth, imgHeight);
  const normalized = new Map<number, PxPoint>();
  landmarks.forEach((lm, i) => {
    if (!lm) return;
    const p = toPx(lm, imgWidth, imgHeight);
    normalized.set(i, { x: (p.x - origin.x) / shoulderWidth, y: (p.y - origin.y) / shoulderWidth });
  });
  return normalized;
}
