/**
 * Ramanujan's second approximation for the circumference of an ellipse
 * with semi-axes a, b. Accurate to well within measurement-relevant
 * tolerances for the aspect ratios a human torso cross-section actually
 * takes (unlike the old circumference = width × flat_constant model,
 * which assumed one universal aspect ratio for every body).
 */
export function ellipseCircumference(semiA: number, semiB: number): number {
  if (semiA <= 0 || semiB <= 0) return 0;
  const h = Math.pow(semiA - semiB, 2) / Math.pow(semiA + semiB, 2);
  return Math.PI * (semiA + semiB) * (1 + (3 * h) / (10 + Math.sqrt(4 - 3 * h)));
}

/** Convenience: circumference directly from full width/depth (not semi-axes). */
export function circumferenceFromWidthDepth(widthCm: number, depthCm: number): number {
  return ellipseCircumference(widthCm / 2, depthCm / 2);
}
