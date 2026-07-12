import type { Landmark, BodyShape } from "../types";
import { LM, toPx, pxDistance } from "../landmarks";
import { getDepthProfile } from "../shape/anthropometricProfiles";

export type LengthResults = {
  shoulderCm: number;
  armLengthCm: number;
  inseamCm: number;
  neckCm: number;
  chestWidthCm: number;
  waistWidthCm: number;
  hipWidthCm: number;
};

export function computeLengths(
  landmarks: Landmark[],
  imgWidth: number,
  imgHeight: number,
  cmPerPx: number,
  shape: BodyShape
): LengthResults | null {
  const ls = landmarks[LM.LEFT_SHOULDER];
  const rs = landmarks[LM.RIGHT_SHOULDER];
  const le = landmarks[LM.LEFT_ELBOW];
  const re = landmarks[LM.RIGHT_ELBOW];
  const lw = landmarks[LM.LEFT_WRIST];
  const rw = landmarks[LM.RIGHT_WRIST];
  const lh = landmarks[LM.LEFT_HIP];
  const rh = landmarks[LM.RIGHT_HIP];
  const la = landmarks[LM.LEFT_ANKLE];
  const ra = landmarks[LM.RIGHT_ANKLE];

  if (!ls || !rs || !le || !re || !lw || !rw || !lh || !rh || !la || !ra) return null;

  const lsPx = toPx(ls, imgWidth, imgHeight);
  const rsPx = toPx(rs, imgWidth, imgHeight);
  const lhPx = toPx(lh, imgWidth, imgHeight);
  const rhPx = toPx(rh, imgWidth, imgHeight);
  const laPx = toPx(la, imgWidth, imgHeight);
  const raPx = toPx(ra, imgWidth, imgHeight);

  const shoulderWidthPx = pxDistance(lsPx, rsPx);
  const hipWidthPx = pxDistance(lhPx, rhPx);

  const armLeftPx =
    pxDistance(lsPx, toPx(le, imgWidth, imgHeight)) + pxDistance(toPx(le, imgWidth, imgHeight), toPx(lw, imgWidth, imgHeight));
  const armRightPx =
    pxDistance(rsPx, toPx(re, imgWidth, imgHeight)) + pxDistance(toPx(re, imgWidth, imgHeight), toPx(rw, imgWidth, imgHeight));
  const armLengthPx = (armLeftPx + armRightPx) / 2;

  const hipMidPx = { x: (lhPx.x + rhPx.x) / 2, y: (lhPx.y + rhPx.y) / 2 };
  const ankleMidPx = { x: (laPx.x + raPx.x) / 2, y: (laPx.y + raPx.y) / 2 };
  const inseamPx = pxDistance(hipMidPx, ankleMidPx);

  const shoulderCm = shoulderWidthPx * cmPerPx;
  const hipWidthCm = hipWidthPx * cmPerPx;

  // Front-width priors — kept from the original model as the *width*
  // input; depth (from side photo or shape profile) and the ellipse
  // formula are what actually replace the old flat-constant approach.
  const chestWidthCm = shoulderCm * 0.9;
  const waistWidthCm = ((shoulderCm + hipWidthCm) / 2) * 0.85;

  const profile = getDepthProfile(shape);

  return {
    shoulderCm: round1(shoulderCm),
    armLengthCm: round1(armLengthPx * cmPerPx),
    inseamCm: round1(inseamPx * cmPerPx),
    neckCm: round1(shoulderCm * profile.neckToShoulderRatio),
    chestWidthCm: round1(chestWidthCm),
    waistWidthCm: round1(waistWidthCm),
    hipWidthCm: round1(hipWidthCm),
  };
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
