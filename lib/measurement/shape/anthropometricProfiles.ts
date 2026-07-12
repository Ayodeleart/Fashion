import type { BodyShape } from "../types";

export type DepthProfile = {
  chestDepthRatio: number; // depth = frontWidth * ratio, when no side photo exists
  waistDepthRatio: number;
  hipDepthRatio: number;
  neckToShoulderRatio: number; // neck circumference ≈ shoulderWidth * ratio
};

/**
 * Starting values based on published general-population anthropometric
 * proportion ranges — NOT a licensed dataset (no access to one). These
 * are explicitly meant to be re-tuned once real tape-measure feedback
 * comes back from actual orders; treat as informed starting points, not
 * ground truth. This is the direct replacement for the old single
 * global CHEST_K=2.7/WAIST_K=2.6/HIP_K=2.65 — now adaptive per body
 * shape instead of one number forced onto every customer.
 */
export const DEPTH_PROFILES: Record<BodyShape, DepthProfile> = {
  slim: { chestDepthRatio: 0.52, waistDepthRatio: 0.5, hipDepthRatio: 0.56, neckToShoulderRatio: 0.37 },
  average: { chestDepthRatio: 0.58, waistDepthRatio: 0.56, hipDepthRatio: 0.62, neckToShoulderRatio: 0.39 },
  athletic: { chestDepthRatio: 0.62, waistDepthRatio: 0.52, hipDepthRatio: 0.58, neckToShoulderRatio: 0.41 },
  curvy: { chestDepthRatio: 0.58, waistDepthRatio: 0.54, hipDepthRatio: 0.68, neckToShoulderRatio: 0.38 },
  plus_size: { chestDepthRatio: 0.66, waistDepthRatio: 0.68, hipDepthRatio: 0.7, neckToShoulderRatio: 0.42 },
};

export function getDepthProfile(shape: BodyShape): DepthProfile {
  return DEPTH_PROFILES[shape];
}
