import type { MeasurementField, ValidationIssue } from "../types";

export type ConfidenceContext = {
  landmarkVisibility: number; // 0-1, mean visibility of landmarks this field depended on
  usedSidePhotoDepth: boolean; // true only for chest/waist/hip when real side-photo depth was used
  shapeClassificationConfidence: number; // 0-100
  warnIssues: ValidationIssue[]; // active "warn" issues on the relevant photo
};

const CIRCUMFERENCE_FIELDS: MeasurementField[] = ["chest", "waist", "hip"];
const NECK_CONFIDENCE_CEILING = 55; // weakest field by construction — no direct landmark exists for it

export function computeConfidence(field: MeasurementField, ctx: ConfidenceContext): number {
  let score = ctx.landmarkVisibility * 100;

  if (CIRCUMFERENCE_FIELDS.includes(field)) {
    // Circumference fields lean on body-shape classification for their
    // depth estimate (directly if no side photo, indirectly as a sanity
    // prior even when one exists), so classification confidence matters
    // here in a way it doesn't for a pure length like shoulder width.
    score = score * 0.6 + ctx.shapeClassificationConfidence * 0.4;
    score += ctx.usedSidePhotoDepth ? 10 : -15;
  }

  const warnPenalty = ctx.warnIssues.length * 15;
  score -= warnPenalty;

  if (field === "neck") {
    score = Math.min(score, NECK_CONFIDENCE_CEILING);
  }

  return Math.round(Math.max(0, Math.min(100, score)));
}
