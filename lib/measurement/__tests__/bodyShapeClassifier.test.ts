import { describe, it, expect } from "vitest";
import { classifyBodyShape } from "../shape/bodyShapeClassifier";
import { makeStandingLandmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT } from "./fixtures";

describe("classifyBodyShape", () => {
  it("classifies broader shoulders than hips as athletic", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.26, hipWidth: 0.16 });
    const { shape } = classifyBodyShape(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(shape).toBe("athletic");
  });

  it("classifies notably wider hips than shoulders as curvy", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.15, hipWidth: 0.22 });
    const { shape } = classifyBodyShape(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(shape).toBe("curvy");
  });

  it("classifies a narrow, elongated torso as slim", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.18, hipWidth: 0.17, torsoLength: 0.4 });
    const { shape } = classifyBodyShape(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(shape).toBe("slim");
  });

  it("classifies a wide, compact torso as plus_size", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.2, hipWidth: 0.22, torsoLength: 0.15 });
    const { shape } = classifyBodyShape(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(shape).toBe("plus_size");
  });

  it("falls back to average with low confidence when landmarks are missing", () => {
    const { shape, confidence } = classifyBodyShape([], DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(shape).toBe("average");
    expect(confidence).toBeLessThanOrEqual(20);
  });

  it("gives higher confidence for more extreme (further from boundary) ratios", () => {
    const mild = makeStandingLandmarks({ shoulderWidth: 0.24, hipWidth: 0.2 });
    const extreme = makeStandingLandmarks({ shoulderWidth: 0.32, hipWidth: 0.16 });
    const mildResult = classifyBodyShape(mild, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    const extremeResult = classifyBodyShape(extreme, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(extremeResult.confidence).toBeGreaterThanOrEqual(mildResult.confidence);
  });

  it("scales confidence down when landmark visibility is poor", () => {
    const goodVis = makeStandingLandmarks({ shoulderWidth: 0.26, hipWidth: 0.16 });
    const poorVis = makeStandingLandmarks({
      shoulderWidth: 0.26,
      hipWidth: 0.16,
      visibilityOverride: { 11: 0.3, 12: 0.3, 23: 0.3, 24: 0.3 },
    });
    const good = classifyBodyShape(goodVis, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    const poor = classifyBodyShape(poorVis, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(poor.confidence).toBeLessThan(good.confidence);
  });
});
