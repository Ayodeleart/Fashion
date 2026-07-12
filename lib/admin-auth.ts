import crypto from "crypto";

const COOKIE_NAME = "ariana_admin_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

// Hardcoded per explicit request — env vars kept failing silently
// (missing on Vercel, not redeployed after being added, trailing
// whitespace from pasting, etc.) and there's nothing sensitive gated
// behind this login. If that changes later (real customer data,
// payment details visible in admin, etc.), move these back to env vars.
const ADMIN_USERNAME = "Ayodeleart1";
const ADMIN_PASSWORD = "@Ayodele10";
const SESSION_SECRET = "7kkJuoxU3vxn29vs6CrAeXN6";

// Google sign-in only confirms IDENTITY — this really is your Google
// account. It is NOT the authorization gate on its own, since anyone
// could otherwise sign in with any Google account. Two real gates:
// (1) the email must be on this allowlist, (2) the access code below.
const ALLOWED_ADMIN_EMAILS = ["ayodeleart1@gmail.com"];

// The actual secret — "so only admin will know the code." Kept as a
// separate constant (not env var) for the same reason as the
// username/password above — nothing sensitive sits behind this gate,
// and env vars have been the actual source of past lockouts, not a
// security concern here. Change this value any time you want to
// rotate the code; no redeploy of anything else is needed.
const ADMIN_ACCESS_CODE = "2048";

export function verifyCredentials(username: string, password: string): boolean {
  const userMatch = timingSafeEqual(username.trim(), ADMIN_USERNAME);
  const passMatch = timingSafeEqual(password.trim(), ADMIN_PASSWORD);
  return userMatch && passMatch;
}

export function isAllowedAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ALLOWED_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export function verifyAccessCode(code: string): boolean {
  return timingSafeEqual(code.trim(), ADMIN_ACCESS_CODE);
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
  const hmac = crypto.createHmac("sha256", SESSION_SECRET).update(String(expires)).digest("hex");
  return `${expires}.${hmac}`;
}

export function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [expiresStr, hmac] = token.split(".");
  if (!expiresStr || !hmac) return false;

  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() > expires) return false;

  const expectedHmac = crypto.createHmac("sha256", SESSION_SECRET).update(expiresStr).digest("hex");
  return timingSafeEqual(hmac, expectedHmac);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = SESSION_MAX_AGE_SECONDS;
