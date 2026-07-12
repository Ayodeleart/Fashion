import type { BodyShape, Landmark } from "../types";
import { LM, toPx, pxDistance, visibility } from "../landmarks";

export type ShapeClassification = { shape: BodyShape; confidence: number };

/**
 * Heuristic thresholds below are informed starting points (general body-
 * proportion literature), not derived from a validated dataset — same
 * honesty caveat as the depth profiles. Two signals combine:
 *   - shoulderToHipRatio: broad shoulders vs. broad hips
 *   - stockiness: hip width relative to torso length (a build-density proxy)
 */
export function classifyBodyShape(landmarks: Landmark[], imgWidth: number, imgHeight: number): ShapeClassification {
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  const lh = landmarks[LM.LEFT_HIP];
  const rh = landmarks[LM.RIGHT_HIP];

  if (!ls || !rs || !lh || !rh) {
    return { shape: "average", confidence: 20 };
  }

  const lsPx = toPx(ls, imgWidth, imgHeight);
  const rsPx = toPx(rs, imgWidth, imgHeight);
  const lhPx = toPx(lh, imgWidth, imgHeight);
  const rhPx = toPx(rh, imgWidth, imgHeight);

  const shoulderWidth = pxDistance(lsPx, rsPx);
  const hipWidth = pxDistance(lhPx, rhPx);
  const shoulderMid = { x: (lsPx.x + rsPx.x) / 2, y: (lsPx.y + rsPx.y) / 2 };
  const hipMid = { x: (lhPx.x + rhPx.x) / 2, y: (lhPx.y + rhPx.y) / 2 };
  const torsoLength = pxDistance(shoulderMid, hipMid);

  if (shoulderWidth <= 0 || hipWidth <= 0 || torsoLength <= 0) {
    return { shape: "average", confidence: 20 };
  }

  const shoulderToHipRatio = shoulderWidth / hipWidth;
  const stockiness = hipWidth / torsoLength;

  let shape: BodyShape;
  let distanceFromBoundary: number;

  if (shoulderToHipRatio > 1.15) {
    shape = "athletic";
    distanceFromBoundary = shoulderToHipRatio - 1.15;
  } else if (shoulderToHipRatio < 0.85) {
    shape = "curvy";
    distanceFromBoundary = 0.85 - shoulderToHipRatio;
  } else if (stockiness < 0.55) {
    shape = "slim";
    distanceFromBoundary = 0.55 - stockiness;
  } else if (stockiness > 0.75) {
    shape = "plus_size";
    distanceFromBoundary = stockiness - 0.75;
  } else {
    shape = "average";
    // "average" has no single boundary distance — use distance to the
    // nearest edge of its own range as the confidence signal instead.
    distanceFromBoundary = Math.min(stockiness - 0.55, 0.75 - stockiness);
  }

  const meanVisibility = (visibility(landmarks, LM.LEFT_SHOULDER) + visibility(landmarks, LM.RIGHT_SHOULDER) + visibility(landmarks, LM.LEFT_HIP) + visibility(landmarks, LM.RIGHT_HIP)) / 4;

  // More extreme ratios (further from a class boundary) → more confident
  // classification. Scaled and clamped into a 30-90 range so classification
  // confidence never claims certainty a heuristic can't back up.
  const boundaryConfidence = Math.min(60, distanceFromBoundary * 300);
  const confidence = Math.round(Math.max(30, Math.min(90, 30 + boundaryConfidence)) * meanVisibility);

  return { shape, confidence };
}
