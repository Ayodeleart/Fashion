import { describe, it, expect } from "vitest";
import { estimateDepthAtRegion } from "../geometry/depth";
import { LM } from "../landmarks";

const IMG_W = 1080;
const IMG_H = 1920;

function makeSideLandmarks(shoulderSpanNorm: number, hipSpanNorm: number, kneeSpanNorm: number) {
  const arr = new Array(33).fill(null).map(() => ({ x: 0.5, y: 0.5, z: 0, visibility: 0.9 }));
  const set = (i: number, x: number, y: number) => (arr[i] = { x, y, z: 0, visibility: 0.9 });
  set(LM.LEFT_SHOULDER, 0.5 - shoulderSpanNorm / 2, 0.2);
  set(LM.RIGHT_SHOULDER, 0.5 + shoulderSpanNorm / 2, 0.2);
  set(LM.LEFT_ELBOW, 0.5 - shoulderSpanNorm / 2 - 0.02, 0.3);
  set(LM.RIGHT_ELBOW, 0.5 + shoulderSpanNorm / 2 + 0.02, 0.3);
  set(LM.LEFT_HIP, 0.5 - hipSpanNorm / 2, 0.5);
  set(LM.RIGHT_HIP, 0.5 + hipSpanNorm / 2, 0.5);
  set(LM.LEFT_KNEE, 0.5 - kneeSpanNorm / 2, 0.7);
  set(LM.RIGHT_KNEE, 0.5 + kneeSpanNorm / 2, 0.7);
  return arr;
}

describe("estimateDepthAtRegion", () => {
  it("returns null when fewer than 2 relevant landmarks are visible", () => {
    const landmarks = makeSideLandmarks(0.1, 0.1, 0.1).map((l, i) =>
      i === LM.LEFT_HIP || i === LM.RIGHT_HIP ? { ...l, visibility: 0.1 } : l
    );
    const result = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "waist", 0.15);
    expect(result).toBeNull();
  });

  it("produces a positive depth for a plausible side-view span", () => {
    const landmarks = makeSideLandmarks(0.12, 0.1, 0.1);
    const result = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "chest", 0.15);
    expect(result).not.toBeNull();
    expect(result!).toBeGreaterThan(0);
  });

  it("scales with cmPerPx", () => {
    const landmarks = makeSideLandmarks(0.12, 0.1, 0.1);
    const small = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "chest", 0.1)!;
    const large = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "chest", 0.2)!;
    expect(large).toBeCloseTo(small * 2, 1);
  });

  it("produces depth estimates for both chest and waist regions", () => {
    const landmarks = makeSideLandmarks(0.1, 0.1, 0.1);
    const chest = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "chest", 0.15);
    const waist = estimateDepthAtRegion(landmarks, IMG_W, IMG_H, "waist", 0.15);
    expect(chest).not.toBeNull();
    expect(waist).not.toBeNull();
  });
});
