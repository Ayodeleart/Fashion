export type {
  Landmark,
  PoseCapture,
  ReferenceObject,
  ScaleSource,
  BodyShape,
  MeasurementField,
  FieldResult,
  MeasurementResult,
  ValidationIssue,
  ValidationResult,
} from "./types";
export { REFERENCE_OBJECT_HEIGHT_CM } from "./types";

export { estimateMeasurementsFromCaptures, type EstimateOutcome } from "./engine/estimator";
export { validateCapture } from "./capture/validation";
export { getGuidance } from "./capture/liveGuidance";
export { REFERENCE_OBJECT_LABELS } from "./calibration/referenceObjects";
