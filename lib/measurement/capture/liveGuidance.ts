import type { Landmark, ValidationResult } from "../types";
import { LM, toPx, pxDistance } from "../landmarks";

/**
 * Priority-ordered: the first applicable message wins, so the person
 * gets one clear instruction at a time instead of a wall of text.
 */
export function getGuidance(validation: ValidationResult, landmarks: Landmark[], imgWidth: number, imgHeight: number): string {
  const codes = new Set(validation.issues.map((i) => i.code));

  if (codes.has("low_resolution")) return "Use the main camera for a clearer shot";
  if (codes.has("missing_landmarks")) return "Step back until your whole body is visible";
  if (codes.has("cropped_head")) return "Move back — your head is out of frame";
  if (codes.has("cropped_feet")) return "Move back — your feet are out of frame";
  if (codes.has("bent_posture")) return "Stand straight";
  if (codes.has("crossed_legs")) return "Uncross your legs, feet shoulder-width apart";
  if (codes.has("arms_covering_torso")) return "Move arms away from body";
  if (codes.has("excessive_rotation")) return "Face the camera directly";

  // No hard issues — check framing tightness as a soft nudge toward the
  // ideal distance (too-far vs too-close), using how much of the frame
  // height the body actually fills.
  const nose = landmarks[LM.NOSE];
  const leftAnkle = landmarks[LM.LEFT_ANKLE];
  const rightAnkle = landmarks[LM.RIGHT_ANKLE];
  if (nose && leftAnkle && rightAnkle) {
    const top = toPx(nose, imgWidth, imgHeight);
    const bottom = toPx(
      { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2, z: 0 },
      imgWidth,
      imgHeight
    );
    const bodyHeightPx = pxDistance(top, bottom);
    const fillRatio = bodyHeightPx / imgHeight;
    if (fillRatio < 0.45) return "Move closer";
    if (fillRatio > 0.9) return "Move back a little";
  }

  if (!validation.ok) return "Adjust your position";
  return "Hold still";
}
