import type { Landmark } from "../types";
import { LM, toPx, visibility } from "../landmarks";

export type BodyRegion = "chest" | "waist" | "hip";

// Skeletal joints don't mark the body's outer skin surface — they mark
// joint centers, which sit somewhat inside the true torso envelope. This
// correction widens the raw joint-to-joint span toward the true surface
// depth. Still an approximation (true depth needs silhouette
// segmentation — see architecture doc §14), but a materially better one
// than assuming depth from width alone with no photo at all.
const JOINT_TO_SURFACE_ENVELOPE: Record<BodyRegion, number> = {
  chest: 1.25,
  waist: 1.15,
  hip: 1.2,
};

const REGION_SPAN_LANDMARKS: Record<BodyRegion, number[]> = {
  chest: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_ELBOW, LM.RIGHT_ELBOW],
  waist: [LM.LEFT_HIP, LM.RIGHT_HIP],
  hip: [LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_KNEE, LM.RIGHT_KNEE],
};

/**
 * Estimates real front-to-back depth at one body region from a side
 * (profile) photo. In a profile shot, the image's horizontal axis IS the
 * body's depth axis, so the horizontal spread of the relevant joints
 * approximates torso thickness at that height.
 *
 * Returns null if the needed landmarks aren't visible enough to trust —
 * callers should fall back to the shape-profile depth prior in that case.
 */
export function estimateDepthAtRegion(
  sideLandmarks: Landmark[],
  imgWidth: number,
  imgHeight: number,
  region: BodyRegion,
  cmPerPx: number
): number | null {
  const spanLandmarks = REGION_SPAN_LANDMARKS[region];
  const visible = spanLandmarks.filter((i) => visibility(sideLandmarks, i) >= 0.4);
  if (visible.length < 2) return null;

  const xs = visible.map((i) => toPx(sideLandmarks[i], imgWidth, imgHeight).x);
  const rawSpanPx = Math.max(...xs) - Math.min(...xs);
  if (rawSpanPx <= 0) return null;

  const rawSpanCm = rawSpanPx * cmPerPx;
  return rawSpanCm * JOINT_TO_SURFACE_ENVELOPE[region];
}
