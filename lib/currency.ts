import { cookies, headers } from "next/headers";
import { CURRENCY_COOKIE_NAME, type Currency } from "@/lib/currency-shared";

export type { Currency } from "@/lib/currency-shared";
export { resolvePrice, CURRENCY_COOKIE_NAME } from "@/lib/currency-shared";

/**
 * Determines which currency to show a visitor:
 * 1. Explicit user choice (cookie), if they've set one — always wins.
 * 2. Otherwise, geo-detected from Vercel's automatic edge header
 *    (x-vercel-ip-country) — Nigeria sees NGN, everyone else sees USD.
 * 3. Falls back to USD if neither is available (e.g. running locally,
 *    where Vercel's geo header doesn't exist).
 *
 * Server-only (uses next/headers) — client components should import
 * resolvePrice/Currency/CURRENCY_COOKIE_NAME from lib/currency-shared
 * instead, not from this file.
 */
export async function resolveCurrency(): Promise<Currency> {
  const cookieStore = await cookies();
  const override = cookieStore.get(CURRENCY_COOKIE_NAME)?.value;
  if (override === "NGN" || override === "USD") return override;

  const headerList = await headers();
  const country = headerList.get("x-vercel-ip-country");
  if (country === "NG") return "NGN";

  return "USD";
}
