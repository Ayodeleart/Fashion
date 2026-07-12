import { describe, it, expect } from "vitest";
import { ellipseCircumference, circumferenceFromWidthDepth } from "../geometry/ellipse";

describe("ellipseCircumference", () => {
  it("matches the known circle circumference when a === b", () => {
    const r = 10;
    expect(ellipseCircumference(r, r)).toBeCloseTo(2 * Math.PI * r, 3);
  });

  it("returns 0 for non-positive axes", () => {
    expect(ellipseCircumference(0, 5)).toBe(0);
    expect(ellipseCircumference(5, -1)).toBe(0);
  });

  it("gives less circumference for a flattened ellipse than the equal-width circle", () => {
    const circle = ellipseCircumference(10, 10);
    const flattened = ellipseCircumference(10, 6);
    expect(flattened).toBeLessThan(circle);
  });

  it("circumferenceFromWidthDepth matches ellipseCircumference on half-axes", () => {
    expect(circumferenceFromWidthDepth(30, 20)).toBeCloseTo(ellipseCircumference(15, 10), 6);
  });

  it("is close to the true value for a known reference ellipse (a=5, b=3)", () => {
    const result = ellipseCircumference(5, 3);
    expect(result).toBeCloseTo(25.5266, 1);
  });
});
