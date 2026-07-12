import type { ReferenceObject } from "../types";
import { REFERENCE_OBJECT_HEIGHT_CM } from "../types";

export { REFERENCE_OBJECT_HEIGHT_CM };

export const REFERENCE_OBJECT_LABELS: Record<ReferenceObject, string> = {
  credit_card: "A standard credit/debit card",
  a4_paper: "A4 sheet of paper",
  phone: "Your phone (average size — least precise option)",
};

/**
 * Contract for a future reference-object detector: given a photo, find
 * the object and return its pixel height. NOT implemented — BlazePose
 * detects human pose landmarks only, not arbitrary objects like a credit
 * card. Actually detecting one needs a separate object-detection model
 * (see docs/measurement-engine-architecture.md §14). This interface
 * exists so calibration/scale.ts and the rest of the pipeline don't need
 * to change shape once that detector exists — only this function's body.
 */
export function detectReferenceObjectPixelHeight(
  _imageData: ImageData,
  _type: ReferenceObject
): number | null {
  return null;
}
