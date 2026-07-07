// Turns MediaPipe BlazePose landmarks (33 points, normalized 0-1 per axis)
// into approximate body measurements. This is photogrammetry from a SINGLE
// 2D frontal photo — there is no depth information, so anything that's a
// circumference (chest/waist/hip) is a real estimate, not a measurement.
// Widths (shoulder-to-shoulder, hip-to-hip) and lengths (arm, inseam) are
// far more reliable since they come straight from pixel distance + a
// height calibration, no ratio-guessing involved.
//
// The circumference multipliers (CHEST_K / WAIST_K / HIP_K) approximate a
// roughly elliptical torso cross-section from its front-on width. They are
// rough industry-standard-ish constants, NOT calibrated against Ariana's
// actual customers yet — tune these once you have real tape-measure
// feedback from a batch of orders. Until then, the UI always requires the
// customer to confirm/adjust every number via slider before it's saved.

export type PoseLandmark = { x: number; y: number; z: number; visibility?: number };

// BlazePose landmark indices used here.
const NOSE = 0;
const LEFT_SHOULDER = 11;
const RIGHT_SHOULDER = 12;
const LEFT_ELBOW = 13;
const RIGHT_ELBOW = 14;
const LEFT_WRIST = 15;
const RIGHT_WRIST = 16;
const LEFT_HIP = 23;
const RIGHT_HIP = 24;
const LEFT_ANKLE = 27;
const RIGHT_ANKLE = 28;

// Nose sits roughly 8-10% of total height down from the top of the head —
// so nose-to-ankle is roughly this fraction of full standing height.
const NOSE_TO_ANKLE_HEIGHT_FRACTION = 0.92;

// Width -> circumference multipliers (front-on width * K ≈ circumference).
const CHEST_K = 2.7;
const WAIST_K = 2.6;
const HIP_K = 2.65;

function dist(a: PoseLandmark, b: PoseLandmark, imgWidth: number, imgHeight: number) {
  const dx = (a.x - b.x) * imgWidth;
  const dy = (a.y - b.y) * imgHeight;
  return Math.sqrt(dx * dx + dy * dy);
}

export type EstimatedMeasurements = {
  shoulderCm: number;
  chestCm: number;
  waistCm: number;
  hipCm: number;
  armLengthCm: number;
  inseamCm: number;
};

export function estimateMeasurements(
  landmarks: PoseLandmark[],
  heightCm: number,
  imgWidth: number,
  imgHeight: number
): EstimatedMeasurements | null {
  const required = [
    NOSE, LEFT_SHOULDER, RIGHT_SHOULDER, LEFT_ELBOW, RIGHT_ELBOW,
    LEFT_WRIST, RIGHT_WRIST, LEFT_HIP, RIGHT_HIP, LEFT_ANKLE, RIGHT_ANKLE,
  ];
  const missing = required.some((i) => !landmarks[i] || (landmarks[i].visibility ?? 1) < 0.4);
  if (missing) return null;

  const noseY = landmarks[NOSE].y * imgHeight;
  const ankleY = ((landmarks[LEFT_ANKLE].y + landmarks[RIGHT_ANKLE].y) / 2) * imgHeight;
  const noseToAnklePx = ankleY - noseY;
  if (noseToAnklePx <= 0) return null;

  const totalHeightPx = noseToAnklePx / NOSE_TO_ANKLE_HEIGHT_FRACTION;
  const scale = heightCm / totalHeightPx; // cm per pixel

  const shoulderWidthPx = dist(landmarks[LEFT_SHOULDER], landmarks[RIGHT_SHOULDER], imgWidth, imgHeight);
  const hipWidthPx = dist(landmarks[LEFT_HIP], landmarks[RIGHT_HIP], imgWidth, imgHeight);
  const waistWidthPx = (shoulderWidthPx + hipWidthPx) / 2 * 0.85;
  const chestWidthPx = shoulderWidthPx * 0.9;

  const armLeftPx =
    dist(landmarks[LEFT_SHOULDER], landmarks[LEFT_ELBOW], imgWidth, imgHeight) +
    dist(landmarks[LEFT_ELBOW], landmarks[LEFT_WRIST], imgWidth, imgHeight);
  const armRightPx =
    dist(landmarks[RIGHT_SHOULDER], landmarks[RIGHT_ELBOW], imgWidth, imgHeight) +
    dist(landmarks[RIGHT_ELBOW], landmarks[RIGHT_WRIST], imgWidth, imgHeight);
  const armLengthPx = (armLeftPx + armRightPx) / 2;

  const hipY = (landmarks[LEFT_HIP].y + landmarks[RIGHT_HIP].y) / 2 * imgHeight;
  const inseamPx = ankleY - hipY;

  const shoulderCm = shoulderWidthPx * scale;
  const chestCm = chestWidthPx * scale * CHEST_K;
  const waistCm = waistWidthPx * scale * WAIST_K;
  const hipCm = hipWidthPx * scale * HIP_K;
  const armLengthCm = armLengthPx * scale;
  const inseamCm = inseamPx * scale;

  return {
    shoulderCm: round1(shoulderCm),
    chestCm: round1(chestCm),
    waistCm: round1(waistCm),
    hipCm: round1(hipCm),
    armLengthCm: round1(armLengthCm),
    inseamCm: round1(inseamCm),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
