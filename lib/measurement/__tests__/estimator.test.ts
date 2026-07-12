import { describe, it, expect } from "vitest";
import { estimateMeasurementsFromCaptures } from "../engine/estimator";
import { makeStandingLandmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT } from "./fixtures";
import type { PoseCapture } from "../types";

function frontCapture(overrides: Parameters<typeof makeStandingLandmarks>[0] = {}): PoseCapture {
  return {
    landmarks: makeStandingLandmarks(overrides),
    imgWidth: DEFAULT_IMG_WIDTH,
    imgHeight: DEFAULT_IMG_HEIGHT,
  };
}

describe("estimateMeasurementsFromCaptures", () => {
  it("produces a full result for a clean front-only capture", () => {
    const outcome = estimateMeasurementsFromCaptures(frontCapture(), null, { kind: "height", heightCm: 170 });
    expect("result" in outcome).toBe(true);
    if ("result" in outcome) {
      expect(outcome.result.fields.shoulder).toBeDefined();
      expect(outcome.result.fields.chest).toBeDefined();
      expect(outcome.result.warnings.some((w) => w.includes("No side photo"))).toBe(true);
    }
  });

  it("rejects instead of measuring when the front photo fails validation", () => {
    const outcome = estimateMeasurementsFromCaptures(frontCapture({ bent: true }), null, { kind: "height", heightCm: 170 });
    expect("rejected" in outcome).toBe(true);
    if ("rejected" in outcome) {
      expect(outcome.rejected.some((i) => i.code === "bent_posture")).toBe(true);
    }
  });

  it("rejects when calibration fails (no usable height/reference data)", () => {
    const badCapture: PoseCapture = { landmarks: [], imgWidth: DEFAULT_IMG_WIDTH, imgHeight: DEFAULT_IMG_HEIGHT };
    const outcome = estimateMeasurementsFromCaptures(badCapture, null, { kind: "height", heightCm: 170 });
    expect("rejected" in outcome).toBe(true);
  });

  it("uses a valid side photo to boost circumference confidence over front-only", () => {
    const front = frontCapture();
    const side: PoseCapture = {
      landmarks: makeStandingLandmarks({ shoulderWidth: 0.1, hipWidth: 0.08 }),
      imgWidth: DEFAULT_IMG_WIDTH,
      imgHeight: DEFAULT_IMG_HEIGHT,
    };

    const frontOnly = estimateMeasurementsFromCaptures(front, null, { kind: "height", heightCm: 170 });
    const withSide = estimateMeasurementsFromCaptures(front, side, { kind: "height", heightCm: 170 });

    expect("result" in frontOnly && "result" in withSide).toBe(true);
    if ("result" in frontOnly && "result" in withSide) {
      expect(withSide.result.fields.chest!.confidence).toBeGreaterThanOrEqual(frontOnly.result.fields.chest!.confidence);
    }
  });

  it("gracefully degrades to front-only when the side photo itself is invalid, rather than failing the whole request", () => {
    const front = frontCapture();
    const invalidSide: PoseCapture = {
      landmarks: makeStandingLandmarks({ bent: true }),
      imgWidth: DEFAULT_IMG_WIDTH,
      imgHeight: DEFAULT_IMG_HEIGHT,
    };
    const outcome = estimateMeasurementsFromCaptures(front, invalidSide, { kind: "height", heightCm: 170 });
    expect("result" in outcome).toBe(true);
    if ("result" in outcome) {
      expect(outcome.result.warnings.some((w) => w.includes("side photo couldn't be used"))).toBe(true);
    }
  });

  it("neck confidence never exceeds its hard ceiling even in an otherwise-ideal capture", () => {
    const front = frontCapture();
    const side: PoseCapture = { landmarks: makeStandingLandmarks({}), imgWidth: DEFAULT_IMG_WIDTH, imgHeight: DEFAULT_IMG_HEIGHT };
    const outcome = estimateMeasurementsFromCaptures(front, side, { kind: "height", heightCm: 170 });
    if ("result" in outcome) {
      expect(outcome.result.fields.neck!.confidence).toBeLessThanOrEqual(55);
    }
  });

  it("every returned field confidence is within [0, 100]", () => {
    const outcome = estimateMeasurementsFromCaptures(frontCapture(), null, { kind: "height", heightCm: 170 });
    if ("result" in outcome) {
      Object.values(outcome.result.fields).forEach((f) => {
        expect(f!.confidence).toBeGreaterThanOrEqual(0);
        expect(f!.confidence).toBeLessThanOrEqual(100);
      });
    }
  });
});
