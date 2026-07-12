import { describe, it, expect } from "vitest";
import { computeConfidence } from "../confidence/confidence";

const baseCtx = {
  landmarkVisibility: 0.9,
  usedSidePhotoDepth: false,
  shapeClassificationConfidence: 80,
  warnIssues: [] as { code: string; message: string; severity: "warn" | "reject" }[],
};

describe("computeConfidence", () => {
  it("gives a pure length field (shoulder) close to raw visibility when clean", () => {
    const score = computeConfidence("shoulder", baseCtx);
    expect(score).toBeCloseTo(90, 0);
  });

  it("boosts circumference confidence when a side photo was used", () => {
    const withoutSide = computeConfidence("chest", { ...baseCtx, usedSidePhotoDepth: false });
    const withSide = computeConfidence("chest", { ...baseCtx, usedSidePhotoDepth: true });
    expect(withSide).toBeGreaterThan(withoutSide);
  });

  it("applies a flat penalty per warn issue", () => {
    const clean = computeConfidence("shoulder", baseCtx);
    const warned = computeConfidence("shoulder", {
      ...baseCtx,
      warnIssues: [{ code: "excessive_rotation", message: "x", severity: "warn" }],
    });
    expect(warned).toBeLessThan(clean);
  });

  it("hard-caps neck confidence regardless of otherwise-perfect inputs", () => {
    const perfectCtx = { landmarkVisibility: 1, usedSidePhotoDepth: true, shapeClassificationConfidence: 100, warnIssues: [] };
    const neckScore = computeConfidence("neck", perfectCtx);
    expect(neckScore).toBeLessThanOrEqual(55);
  });

  it("never returns a value outside [0, 100]", () => {
    const terrible = computeConfidence("chest", {
      landmarkVisibility: 0,
      usedSidePhotoDepth: false,
      shapeClassificationConfidence: 0,
      warnIssues: [
        { code: "a", message: "", severity: "warn" },
        { code: "b", message: "", severity: "warn" },
        { code: "c", message: "", severity: "warn" },
      ],
    });
    expect(terrible).toBeGreaterThanOrEqual(0);
    expect(terrible).toBeLessThanOrEqual(100);

    const perfect = computeConfidence("shoulder", {
      landmarkVisibility: 1,
      usedSidePhotoDepth: true,
      shapeClassificationConfidence: 100,
      warnIssues: [],
    });
    expect(perfect).toBeLessThanOrEqual(100);
  });
});
