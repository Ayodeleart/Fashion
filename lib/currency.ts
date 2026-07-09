import type { Currency } from "@/lib/currency-shared";

export type { Currency } from "@/lib/currency-shared";
export { resolvePrice, CURRENCY_COOKIE_NAME } from "@/lib/currency-shared";

/**
 * Currency is locked to NGN — this store's Paystack account isn't set up
 * to process USD, so the previous geo-detected USD-for-non-Nigeria logic
 * was silently breaking checkout for anyone outside Nigeria (Paystack's
 * initialize call would reject a currency the account isn't enabled for).
 * Kept as an async function so callers don't need to change.
 */
export async function resolveCurrency(): Promise<Currency> {
  return "NGN";
}
