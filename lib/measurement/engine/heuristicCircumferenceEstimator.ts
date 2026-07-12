import type { CircumferenceEstimator, CircumferenceInput, CircumferenceOutput } from "./interfaces";
import { estimateDepthAtRegion } from "../geometry/depth";
import { circumferenceFromWidthDepth } from "../geometry/ellipse";
import { getDepthProfile } from "../shape/anthropometricProfiles";

export class HeuristicCircumferenceEstimator implements CircumferenceEstimator {
  estimate(input: CircumferenceInput): CircumferenceOutput {
    const { side, cmPerPx, shape, chestWidthCm, waistWidthCm, hipWidthCm } = input;
    const profile = getDepthProfile(shape);

    let chestDepthCm: number | null = null;
    let waistDepthCm: number | null = null;
    let hipDepthCm: number | null = null;
    let usedSidePhotoDepth = false;

    if (side) {
      chestDepthCm = estimateDepthAtRegion(side.landmarks, side.imgWidth, side.imgHeight, "chest", cmPerPx);
      waistDepthCm = estimateDepthAtRegion(side.landmarks, side.imgWidth, side.imgHeight, "waist", cmPerPx);
      hipDepthCm = estimateDepthAtRegion(side.landmarks, side.imgWidth, side.imgHeight, "hip", cmPerPx);
      usedSidePhotoDepth = chestDepthCm !== null && waistDepthCm !== null && hipDepthCm !== null;
    }

    const finalChestDepth = chestDepthCm ?? chestWidthCm * profile.chestDepthRatio;
    const finalWaistDepth = waistDepthCm ?? waistWidthCm * profile.waistDepthRatio;
    const finalHipDepth = hipDepthCm ?? hipWidthCm * profile.hipDepthRatio;

    return {
      chestCm: round1(circumferenceFromWidthDepth(chestWidthCm, finalChestDepth)),
      waistCm: round1(circumferenceFromWidthDepth(waistWidthCm, finalWaistDepth)),
      hipCm: round1(circumferenceFromWidthDepth(hipWidthCm, finalHipDepth)),
      usedSidePhotoDepth,
    };
  }
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
