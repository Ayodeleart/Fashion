import type { Landmark, ScaleSource } from "../types";
import { LM, toPx, pxDistance } from "../landmarks";
import { REFERENCE_OBJECT_HEIGHT_CM } from "./referenceObjects";

// Nose sits roughly this fraction down from true head-top for a typical
// adult standing posture — used only to convert nose-to-ankle pixel span
// into a full-height pixel span.
const NOSE_TO_ANKLE_HEIGHT_FRACTION = 0.92;

/**
 * Approximate tilt compensation: a phone tilted forward/back by
 * `tiltDegrees` foreshortens the subject's vertical extent in the image
 * plane. Dividing by cos(tilt) is a first-order correction, accurate for
 * small-to-moderate tilt (roughly under 20°) at typical phone-to-subject
 * shooting distances — not a full perspective/camera-intrinsics model.
 * Good enough to meaningfully help; not claimed to be exact.
 */
function tiltCompensate(pixelSpan: number, tiltDegrees: number): number {
  const clamped = Math.max(-45, Math.min(45, tiltDegrees));
  const factor = Math.cos((clamped * Math.PI) / 180);
  return factor > 0.1 ? pixelSpan / factor : pixelSpan;
}

/**
 * Returns cm-per-pixel for one photo, or null if calibration isn't
 * possible from the given source + landmarks (e.g. ankles not visible).
 */
export function estimateScale(
  source: ScaleSource,
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number,
  tiltDegrees = 0
): number | null {
  if (source.kind === "height") {
    const nose = landmarks[LM.NOSE];
    const leftAnkle = landmarks[LM.LEFT_ANKLE];
    const rightAnkle = landmarks[LM.RIGHT_ANKLE];
    if (!nose || !leftAnkle || !rightAnkle) return null;

    const nosePx = toPx(nose, imgWidth, imgHeight);
    const ankleMidPxAbs = toPx(
      { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2, z: 0 },
      imgWidth,
      imgHeight
    );
    const noseToAnklePx = tiltCompensate(pxDistance(nosePx, ankleMidPxAbs), tiltDegrees);
    if (noseToAnklePx <= 0) return null;

    const totalHeightPx = noseToAnklePx / NOSE_TO_ANKLE_HEIGHT_FRACTION;
    return source.heightCm / totalHeightPx;
  }

  // reference_object
  const realHeightCm = REFERENCE_OBJECT_HEIGHT_CM[source.type];
  if (!source.pixelHeight || source.pixelHeight <= 0) return null;
  return realHeightCm / tiltCompensate(source.pixelHeight, tiltDegrees);
}

/**
 * Cross-check: independently estimates height from the photo itself,
 * regardless of what calibration source was used. When the calibration
 * source IS height, comparing this against the typed value catches bad
 * poses/tilt/wrong-height-entered rather than silently trusting either
 * number. Returns null if landmarks are insufficient.
 */
export function estimatePhotoHeightCm(
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number,
  cmPerPx: number
): number | null {
  const nose = landmarks[LM.NOSE];
  const leftAnkle = landmarks[LM.LEFT_ANKLE];
  const rightAnkle = landmarks[LM.RIGHT_ANKLE];
  if (!nose || !leftAnkle || !rightAnkle) return null;

  const nosePx = toPx(nose, imgWidth, imgHeight);
  const ankleMidPxAbs = toPx(
    { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2, z: 0 },
    imgWidth,
    imgHeight
  );
  const noseToAnklePx = pxDistance(nosePx, ankleMidPxAbs);
  return (noseToAnklePx / NOSE_TO_ANKLE_HEIGHT_FRACTION) * cmPerPx;
}
