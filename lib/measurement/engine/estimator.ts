import type { Landmark, MeasurementField, MeasurementResult, PoseCapture, ScaleSource, ValidationIssue } from "../types";
import { validateCapture } from "../capture/validation";
import { estimateScale, estimatePhotoHeightCm } from "../calibration/scale";
import { classifyBodyShape } from "../shape/bodyShapeClassifier";
import { computeLengths } from "../geometry/lengths";
import { computeConfidence } from "../confidence/confidence";
import { HeuristicCircumferenceEstimator } from "./heuristicCircumferenceEstimator";
import type { CircumferenceEstimator } from "./interfaces";
import { LM, visibility } from "../landmarks";

export type EstimateOutcome = { result: MeasurementResult } | { rejected: ValidationIssue[] };

// Composition root — swap this one line to plug in a future trained
// model without touching anything below it or any caller.
const circumferenceEstimator: CircumferenceEstimator = new HeuristicCircumferenceEstimator();

// Which landmarks each field's calculation actually depends on, used to
// compute a real mean-visibility confidence input per field rather than
// one blanket number for everything.
const FIELD_LANDMARKS: Record<MeasurementField, number[]> = {
  height: [LM.NOSE, LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
  shoulder: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  sleeve: [LM.LEFT_SHOULDER, LM.LEFT_ELBOW, LM.LEFT_WRIST, LM.RIGHT_SHOULDER, LM.RIGHT_ELBOW, LM.RIGHT_WRIST],
  inseam: [LM.LEFT_HIP, LM.RIGHT_HIP, LM.LEFT_ANKLE, LM.RIGHT_ANKLE],
  neck: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  chest: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER],
  waist: [LM.LEFT_SHOULDER, LM.RIGHT_SHOULDER, LM.LEFT_HIP, LM.RIGHT_HIP],
  hip: [LM.LEFT_HIP, LM.RIGHT_HIP],
};

function meanVisibilityFor(field: MeasurementField, landmarks: Landmark[]): number {
  const indices = FIELD_LANDMARKS[field];
  const scores = indices.map((i) => visibility(landmarks, i));
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

export function estimateMeasurementsFromCaptures(
  front: PoseCapture,
  side: PoseCapture | null,
  scaleSource: ScaleSource
): EstimateOutcome {
  const frontValidation = validateCapture(front.landmarks, front.imgWidth, front.imgHeight);
  if (!frontValidation.ok) {
    return { rejected: frontValidation.issues };
  }

  const cmPerPx = estimateScale(scaleSource, front.landmarks, front.imgWidth, front.imgHeight);
  if (!cmPerPx) {
    return {
      rejected: [
        {
          code: "calibration_failed",
          message: "Couldn't calibrate scale from that photo — try again with your full body visible.",
          severity: "reject",
        },
      ],
    };
  }

  const { shape, confidence: shapeConfidence } = classifyBodyShape(front.landmarks, front.imgWidth, front.imgHeight);

  const lengths = computeLengths(front.landmarks, front.imgWidth, front.imgHeight, cmPerPx, shape);
  if (!lengths) {
    return {
      rejected: [{ code: "insufficient_landmarks", message: "Couldn't get a full reading from that photo — try again.", severity: "reject" }],
    };
  }

  // A side photo only counts if it independently passes its own capture
  // validation — an invalid side photo silently degrades to "no side
  // photo" (lower confidence, not a hard failure) rather than blocking
  // the whole flow over an optional extra.
  let validSide: PoseCapture | null = null;
  if (side) {
    const sideValidation = validateCapture(side.landmarks, side.imgWidth, side.imgHeight);
    if (sideValidation.ok) validSide = side;
  }

  const circumferences = circumferenceEstimator.estimate({
    front,
    side: validSide,
    cmPerPx,
    shape,
    chestWidthCm: lengths.chestWidthCm,
    waistWidthCm: lengths.waistWidthCm,
    hipWidthCm: lengths.hipWidthCm,
  });

  const warnIssues = frontValidation.issues.filter((i) => i.severity === "warn");

  const fieldValues: Record<MeasurementField, number> = {
    shoulder: lengths.shoulderCm,
    sleeve: lengths.armLengthCm,
    inseam: lengths.inseamCm,
    neck: lengths.neckCm,
    chest: circumferences.chestCm,
    waist: circumferences.waistCm,
    hip: circumferences.hipCm,
    height: estimatePhotoHeightCm(front.landmarks, front.imgWidth, front.imgHeight, cmPerPx) ?? 0,
  };

  const fields: MeasurementResult["fields"] = {};
  (Object.keys(fieldValues) as MeasurementField[]).forEach((field) => {
    fields[field] = {
      valueCm: fieldValues[field],
      confidence: computeConfidence(field, {
        landmarkVisibility: meanVisibilityFor(field, front.landmarks),
        usedSidePhotoDepth: circumferences.usedSidePhotoDepth,
        shapeClassificationConfidence: shapeConfidence,
        warnIssues,
      }),
    };
  });

  const warnings = warnIssues.map((i) => i.message);
  if (side && !validSide) {
    warnings.push("Your side photo couldn't be used — chest/waist/hip are estimated from the front photo alone.");
  }
  if (!side) {
    warnings.push("No side photo — chest, waist, and hip are estimates. Add a side photo for a more accurate read.");
  }

  return {
    result: {
      fields,
      bodyShape: shape,
      usedSidePhoto: circumferences.usedSidePhotoDepth,
      warnings,
    },
  };
}
