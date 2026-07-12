import { describe, it, expect } from "vitest";
import { validateCapture } from "../capture/validation";
import { makeStandingLandmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT } from "./fixtures";

describe("validateCapture", () => {
  it("passes a clean standing pose", () => {
    const landmarks = makeStandingLandmarks({});
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.ok).toBe(true);
  });

  it("rejects low resolution regardless of pose", () => {
    const landmarks = makeStandingLandmarks({});
    const result = validateCapture(landmarks, 200, 300);
    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain("low_resolution");
  });

  it("rejects missing core landmarks", () => {
    const landmarks = makeStandingLandmarks({ visibilityOverride: { 11: 0.1, 12: 0.1 } });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.ok).toBe(false);
    expect(result.issues.map((i) => i.code)).toContain("missing_landmarks");
  });

  it("rejects a cropped head", () => {
    const landmarks = makeStandingLandmarks({ headY: 0.001 });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.issues.map((i) => i.code)).toContain("cropped_head");
  });

  it("rejects cropped feet", () => {
    const landmarks = makeStandingLandmarks({ legLength: 5 });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.issues.map((i) => i.code)).toContain("cropped_feet");
  });

  it("rejects bent posture", () => {
    const landmarks = makeStandingLandmarks({ bent: true });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.issues.map((i) => i.code)).toContain("bent_posture");
  });

  it("rejects crossed legs", () => {
    const landmarks = makeStandingLandmarks({ crossedLegs: true });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.issues.map((i) => i.code)).toContain("crossed_legs");
  });

  it("rejects arms covering the torso", () => {
    const landmarks = makeStandingLandmarks({ armsOut: false });
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.issues.map((i) => i.code)).toContain("arms_covering_torso");
  });

  it("warns (not rejects) on excessive rotation", () => {
    const landmarks = makeStandingLandmarks({});
    landmarks[11] = { ...landmarks[11], y: landmarks[11].y - 0.1 };
    const result = validateCapture(landmarks, DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    const rotationIssue = result.issues.find((i) => i.code === "excessive_rotation");
    expect(rotationIssue?.severity).toBe("warn");
  });

  it("stops at missing_landmarks without throwing on further geometric checks", () => {
    expect(() => validateCapture([], DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT)).not.toThrow();
    const result = validateCapture([], DEFAULT_IMG_WIDTH, DEFAULT_IMG_HEIGHT);
    expect(result.ok).toBe(false);
  });
});
