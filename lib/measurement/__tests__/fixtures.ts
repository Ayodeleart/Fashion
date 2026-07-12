import type { Landmark } from "../types";
import { LM } from "../landmarks";

/**
 * Builds a plausible 33-point standing-pose landmark array (normalized
 * 0-1 coordinates) from a small set of body proportion knobs, so tests
 * can construct different body types/poses without hand-writing 33
 * points every time. Only fields the engine actually reads are given
 * realistic values; everything else defaults to a reasonable filler.
 */
export function makeStandingLandmarks(opts: {
  shoulderWidth?: number; // normalized units
  hipWidth?: number;
  torsoLength?: number; // shoulder-mid to hip-mid, normalized
  legLength?: number; // hip-mid to ankle-mid, normalized
  centerX?: number;
  headY?: number;
  visibilityOverride?: Partial<Record<number, number>>;
  armsOut?: boolean; // if false, wrists sit close to torso (occlusion test)
  bent?: boolean;
  crossedLegs?: boolean;
}): Landmark[] {
  const {
    shoulderWidth = 0.2,
    hipWidth = 0.16,
    torsoLength = 0.25,
    legLength = 0.4,
    centerX = 0.5,
    headY = 0.08,
    visibilityOverride = {},
    armsOut = true,
    bent = false,
    crossedLegs = false,
  } = opts;

  const shoulderY = headY + 0.1;
  const hipY = shoulderY + torsoLength;
  const kneeY = hipY + legLength / 2;
  const ankleY = hipY + legLength;

  const bendXOffset = bent ? shoulderWidth * 1.5 : 0;

  const arr: Landmark[] = new Array(33).fill(null).map(() => ({ x: centerX, y: 0.5, z: 0, visibility: 0.9 }));

  const set = (i: number, x: number, y: number, v = 0.95) => {
    arr[i] = { x, y, z: 0, visibility: visibilityOverride[i] ?? v };
  };

  set(LM.NOSE, centerX + bendXOffset, headY);
  set(LM.LEFT_SHOULDER, centerX - shoulderWidth / 2 + bendXOffset, shoulderY);
  set(LM.RIGHT_SHOULDER, centerX + shoulderWidth / 2 + bendXOffset, shoulderY);
  set(LM.LEFT_ELBOW, armsOut ? centerX - shoulderWidth / 2 - 0.08 : centerX - shoulderWidth / 4, shoulderY + 0.12);
  set(LM.RIGHT_ELBOW, armsOut ? centerX + shoulderWidth / 2 + 0.08 : centerX + shoulderWidth / 4, shoulderY + 0.12);
  set(LM.LEFT_WRIST, armsOut ? centerX - shoulderWidth / 2 - 0.1 : centerX - 0.02, shoulderY + 0.22);
  set(LM.RIGHT_WRIST, armsOut ? centerX + shoulderWidth / 2 + 0.1 : centerX + 0.02, shoulderY + 0.22);
  set(LM.LEFT_HIP, centerX - hipWidth / 2, hipY);
  set(LM.RIGHT_HIP, centerX + hipWidth / 2, hipY);
  set(LM.LEFT_KNEE, crossedLegs ? centerX + 0.02 : centerX - hipWidth / 2, kneeY);
  set(LM.RIGHT_KNEE, crossedLegs ? centerX - 0.02 : centerX + hipWidth / 2, kneeY);
  set(LM.LEFT_ANKLE, crossedLegs ? centerX + 0.03 : centerX - hipWidth / 2, ankleY);
  set(LM.RIGHT_ANKLE, crossedLegs ? centerX - 0.03 : centerX + hipWidth / 2, ankleY);

  return arr;
}

export const DEFAULT_IMG_WIDTH = 1080;
export const DEFAULT_IMG_HEIGHT = 1920;
