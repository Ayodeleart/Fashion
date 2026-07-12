import { describe, it, expect } from "vitest";
import { computeLengths } from "../geometry/lengths";
import { makeStandingLandmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT } from "./fixtures";

describe("computeLengths", () => {
  it("returns null when required landmarks are absent", () => {
    const result = computeLengths([], DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.2, "average");
    expect(result).toBeNull();
  });

  it("produces plausible shoulder width for a known normalized shoulder span", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.2 });
    const cmPerPx = 0.15;
    const result = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, cmPerPx, "average");
    expect(result).not.toBeNull();
    const expectedCm = 0.2 * DEFAULT_IMG_WIDTH * cmPerPx;
    expect(result!.shoulderCm).toBeCloseTo(expectedCm, 0);
  });

  it("scales all length fields with cmPerPx", () => {
    const landmarks = makeStandingLandmarks({});
    const small = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.1, "average")!;
    const large = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.2, "average")!;
    expect(large.shoulderCm).toBeCloseTo(small.shoulderCm * 2, 0);
    expect(large.armLengthCm).toBeCloseTo(small.armLengthCm * 2, 0);
    expect(large.inseamCm).toBeCloseTo(small.inseamCm * 2, 0);
  });

  it("neck ratio differs by body shape", () => {
    const landmarks = makeStandingLandmarks({});
    const slim = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.15, "slim")!;
    const plusSize = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.15, "plus_size")!;
    expect(plusSize.neckCm).toBeGreaterThan(slim.neckCm);
  });

  it("front-width priors stay proportional to shoulder/hip inputs", () => {
    const landmarks = makeStandingLandmarks({ shoulderWidth: 0.2, hipWidth: 0.18 });
    const result = computeLengths(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT, 0.15, "average")!;
    expect(result.chestWidthCm).toBeCloseTo(result.shoulderCm * 0.9, 0);
  });
});
