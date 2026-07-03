import crypto from "crypto";

const COOKIE_NAME = "ariana_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not set — required to sign admin login sessions.");
  }
  return secret;
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME?.trim();
  const expectedPass = process.env.ADMIN_PASSWORD?.trim();
  if (!expectedUser || !expectedPass) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD are not set in the environment.");
  }
  // Timing-safe comparison so response time can't be used to guess characters.
  // Both sides trimmed — a stray trailing space/newline from pasting a value
  // into Vercel's env var UI (very common) would otherwise cause a silent,
  // confusing "incorrect password" even when the visible text matches.
  const userMatch = timingSafeEqual(username.trim(), expectedUser);
  const passMatch = timingSafeEqual(password.trim(), expectedPass);
  return userMatch && passMatch;
}

function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/** Creates a signed session value: "<expiry>.<hmac>" */
export function createSessionToken(): string {
  const expires = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;
  const hmac = crypto.createHmac("sha256", sessionSecret()).update(String(expires)).digest("hex");
  return `${expires}.${hmac}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresStr, hmac] = token.split(".");
  if (!expiresStr || !hmac) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expectedHmac = crypto.createHmac("sha256", sessionSecret()).update(expiresStr).digest("hex");
  return timingSafeEqual(hmac, expectedHmac);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
