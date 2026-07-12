import type { Landmark, ValidationIssue, ValidationResult } from "../types";
import { LM, CORE_LANDMARKS, toPx, pxDistance, visibility } from "../landmarks";

const MIN_VISIBILITY = 0.5;
const MIN_IMAGE_WIDTH = 480;
const MIN_IMAGE_HEIGHT = 640;
const EDGE_MARGIN_FRACTION = 0.02; // landmark within 2% of frame edge = likely cropped

function angleAtDeg(
  p1: { x: number; y: number },
  vertex: { x: number; y: number },
  p2: { x: number; y: number }
): number {
  const v1 = { x: p1.x - vertex.x, y: p1.y - vertex.y };
  const v2 = { x: p2.x - vertex.x, y: p2.y - vertex.y };
  const dot = v1.x * v2.x + v1.y * v2.y;
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) return 180;
  const cos = Math.max(-1, Math.min(1, dot / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

/**
 * Checks a single photo (or live frame) for capture-quality problems
 * before it's used for measurement.
 *
 * Scope note: these are all geometric checks on the *skeleton* — 33
 * BlazePose joint keypoints. They cannot see clothing, fabric, or
 * silhouette. "Oversized clothing" is deliberately NOT checked here; it
 * needs image segmentation against a body silhouette, a different model
 * entirely (see docs/measurement-engine-architecture.md §14). Faking a
 * check for it would just be a false claim dressed up as a feature.
 */
export function validateCapture(landmarks: Landmark[], imgWidth: number, imgHeight: number): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (imgWidth < MIN_IMAGE_WIDTH || imgHeight < MIN_IMAGE_HEIGHT) {
    issues.push({
      code: "low_resolution",
      message: "That photo's resolution is too low for an accurate read.",
      severity: "reject",
    });
  }

  const missingCore = CORE_LANDMARKS.filter((i) => visibility(landmarks, i) < MIN_VISIBILITY);
  if (missingCore.length > 0) {
    issues.push({
      code: "missing_landmarks",
      message: "Couldn't clearly see your full body — make sure head, shoulders, hips, and feet are all in frame.",
      severity: "reject",
    });
    return { ok: false, issues }; // no landmark geometry is trustworthy past this point
  }

  const nose = toPx(landmarks[LM.NOSE], imgWidth, imgHeight);
  const leftAnkle = toPx(landmarks[LM.LEFT_ANKLE], imgWidth, imgHeight);
  const rightAnkle = toPx(landmarks[LM.RIGHT_ANKLE], imgWidth, imgHeight);
  const leftShoulder = toPx(landmarks[LM.LEFT_SHOULDER], imgWidth, imgHeight);
  const rightShoulder = toPx(landmarks[LM.RIGHT_SHOULDER], imgWidth, imgHeight);
  const leftHip = toPx(landmarks[LM.LEFT_HIP], imgWidth, imgHeight);
  const rightHip = toPx(landmarks[LM.RIGHT_HIP], imgWidth, imgHeight);
  const leftKnee = toPx(landmarks[LM.LEFT_KNEE], imgWidth, imgHeight);
  const rightKnee = toPx(landmarks[LM.RIGHT_KNEE], imgWidth, imgHeight);
  const leftWrist = toPx(landmarks[LM.LEFT_WRIST], imgWidth, imgHeight);
  const rightWrist = toPx(landmarks[LM.RIGHT_WRIST], imgWidth, imgHeight);

  const edgeMarginY = imgHeight * EDGE_MARGIN_FRACTION;
  if (nose.y < edgeMarginY) {
    issues.push({ code: "cropped_head", message: "Your head is too close to the top of the frame — step back.", severity: "reject" });
  }
  if (Math.max(leftAnkle.y, rightAnkle.y) > imgHeight - edgeMarginY) {
    issues.push({ code: "cropped_feet", message: "Your feet are cut off — fit your whole body in frame.", severity: "reject" });
  }

  const hipMid = { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 };
  const shoulderMid = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 };
  const kneeMid = { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 };
  if (angleAtDeg(shoulderMid, hipMid, kneeMid) < 155) {
    issues.push({ code: "bent_posture", message: "Stand up straight, facing the camera.", severity: "reject" });
  }

  const hipWidth = pxDistance(leftHip, rightHip);
  const ankleWidth = pxDistance(leftAnkle, rightAnkle);
  const anklesCrossed = leftAnkle.x > rightAnkle.x;
  if (anklesCrossed || (hipWidth > 0 && ankleWidth / hipWidth < 0.3)) {
    issues.push({ code: "crossed_legs", message: "Stand with feet shoulder-width apart, not crossed.", severity: "reject" });
  }

  const torsoMinX = Math.min(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x);
  const torsoMaxX = Math.max(leftShoulder.x, rightShoulder.x, leftHip.x, rightHip.x);
  function wristBlocksTorso(wrist: { x: number; y: number }) {
    return wrist.x > torsoMinX && wrist.x < torsoMaxX && wrist.y > shoulderMid.y && wrist.y < hipMid.y;
  }
  if (wristBlocksTorso(leftWrist) || wristBlocksTorso(rightWrist)) {
    issues.push({ code: "arms_covering_torso", message: "Keep your arms slightly away from your body.", severity: "reject" });
  }

  const shoulderWidth = pxDistance(leftShoulder, rightShoulder);
  const shoulderTilt = Math.abs(leftShoulder.y - rightShoulder.y);
  if (shoulderWidth > 0 && shoulderTilt / shoulderWidth > 0.35) {
    issues.push({ code: "excessive_rotation", message: "Face the camera directly rather than at an angle.", severity: "warn" });
  }

  return { ok: issues.every((i) => i.severity !== "reject"), issues };
}

export { angleAtDeg };
