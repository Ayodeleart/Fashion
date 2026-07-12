import type { BodyShape, Landmark, PoseCapture } from "../types";

export type CircumferenceInput = {
  front: PoseCapture;
  side: PoseCapture | null;
  cmPerPx: number;
  shape: BodyShape;
  chestWidthCm: number;
  waistWidthCm: number;
  hipWidthCm: number;
};

export type CircumferenceOutput = {
  chestCm: number;
  waistCm: number;
  hipCm: number;
  usedSidePhotoDepth: boolean;
};

/**
 * Today's implementation (HeuristicCircumferenceEstimator, composed in
 * estimator.ts) uses the ellipse+depth-profile logic in this folder. A
 * future trained regression model — on-device via TensorFlow.js, or a
 * server API call — would implement this same interface and swap in at
 * the composition root in estimator.ts, with zero changes needed to
 * MeasurementsFlow.tsx, the DB schema, or the public
 * estimateMeasurementsFromCaptures() signature.
 *
 * The real blocker for that swap isn't this interface — it's the absence
 * of a real photo + tape-measure-verified training dataset. See
 * lib/measurement/ml/regressionEstimator.ts.
 */
export interface CircumferenceEstimator {
  estimate(input: CircumferenceInput): CircumferenceOutput;
}

export interface BodyShapeEstimator {
  estimate(landmarks: Landmark[], imgWidth: number, imgHeight: number): { shape: BodyShape; confidence: number };
}
