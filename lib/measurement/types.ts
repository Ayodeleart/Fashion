// Shared types for the measurement engine. Kept framework-agnostic (no
// MediaPipe imports here) so the pure logic in this folder can be unit
// tested with plain fixture objects, and so a future replacement pose
// detector wouldn't require touching these types.

export type Landmark = { x: number; y: number; z: number; visibility?: number };

/** Raw pose detection result for one photo, plus the image it came from. */
export type PoseCapture = {
  landmarks: Landmark[];
  imgWidth: number;
  imgHeight: number;
};

export type ReferenceObject = "credit_card" | "a4_paper" | "phone";

/** Known real-world dimensions (cm) for supported scale references. */
export const REFERENCE_OBJECT_HEIGHT_CM: Record<ReferenceObject, number> = {
  credit_card: 5.398, // ISO/IEC 7810 ID-1, long edge
  a4_paper: 29.7,
  phone: 14.7, // rough average modern phone height — least precise option
};

export type ScaleSource =
  | { kind: "height"; heightCm: number }
  | { kind: "reference_object"; type: ReferenceObject; pixelHeight: number };

export type BodyShape = "slim" | "average" | "athletic" | "curvy" | "plus_size";

export type MeasurementField =
  | "height"
  | "shoulder"
  | "chest"
  | "waist"
  | "hip"
  | "sleeve"
  | "inseam"
  | "neck";

export type FieldResult = {
  valueCm: number;
  /** 0-100. See confidence.ts for how this is composed. */
  confidence: number;
};

export type MeasurementResult = {
  fields: Partial<Record<MeasurementField, FieldResult>>;
  bodyShape: BodyShape;
  usedSidePhoto: boolean;
  warnings: string[];
};

/** A capture-quality problem detected before/instead of measuring. */
export type ValidationIssue = {
  code: string;
  message: string;
  /** "reject" blocks measurement entirely; "warn" lowers confidence but still measures. */
  severity: "reject" | "warn";
};

export type ValidationResult = {
  ok: boolean;
  issues: ValidationIssue[];
};
