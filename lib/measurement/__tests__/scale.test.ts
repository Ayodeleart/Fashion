import { describe, it, expect } from "vitest";
import { estimateScale, estimatePhotoHeightCm } from "../calibration/scale";
import { makeStandingLandmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT } from "./fixtures";

describe("estimateScale — height calibration", () => {
  it("returns a sensible cm-per-px for a typical standing pose", () => {
    const landmarks = makeStandingLandmarks({});
    const scale = estimateScale({ kind: "height", heightCm: 170 }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(scale).not.toBeNull();
    expect(scale!).toBeGreaterThan(0);
    expect(scale!).toBeGreaterThan(0.05);
    expect(scale!).toBeLessThan(1);
  });

  it("scales proportionally with height input", () => {
    const landmarks = makeStandingLandmarks({});
    const scaleShort = estimateScale({ kind: "height", heightCm: 150 }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT)!;
    const scaleTall = estimateScale({ kind: "height", heightCm: 200 }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT)!;
    expect(scaleTall).toBeGreaterThan(scaleShort);
    expect(scaleTall / scaleShort).toBeCloseTo(200 / 150, 5);
  });

  it("tilt compensation decreases the derived scale (corrected span is larger for the same real height)", () => {
    const landmarks = makeStandingLandmarks({});
    const flat = estimateScale({ kind: "height", heightCm: 170 }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0)!;
    const tilted = estimateScale({ kind: "height", heightCm: 170 }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 20)!;
    expect(tilted).toBeLessThan(flat);
  });
});

describe("estimateScale — reference object calibration", () => {
  it("derives a plausible scale from a credit-card-sized pixel span", () => {
    const scale = estimateScale({ kind: "reference_object", type: "credit_card", pixelHeight: 300 }, [], 1080, 1920);
    expect(scale).not.toBeNull();
    expect(scale!).toBeCloseTo(5.398 / 300, 6);
  });

  it("returns null for a zero pixel height", () => {
    const scale = estimateScale({ kind: "reference_object", type: "a4_paper", pixelHeight: 0 }, [], 1080, 1920);
    expect(scale).toBeNull();
  });
});

describe("estimatePhotoHeightCm", () => {
  it("round-trips: calibrating scale from a known height then re-estimating height returns ~the same value", () => {
    const landmarks = makeStandingLandmarks({});
    const heightCm = 175;
    const scale = estimateScale({ kind: "height", heightCm }, landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT)!;
    const reEstimated = estimatePhotoHeightCm(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, scale)!;
    expect(reEstimated).toBeCloseTo(heightCm, 3);
  });
});
