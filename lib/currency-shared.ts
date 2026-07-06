export type Currency = "NGN" | "USD";

export const CURRENCY_COOKIE_NAME = "preferred_currency";

type PriceableProduct = {
  price: number;
  currency: string;
  price_ngn?: number | null;
};

/**
 * Resolves the actual number + currency code to display/charge for a
 * product, given the visitor's resolved currency.
 *
 * Deliberately does NOT auto-convert via an FX rate — that's a real
 * commercial risk (rates drift, margins get eaten) without admin
 * sign-off. Instead: admin explicitly sets price_ngn per product. If
 * they haven't, Nigerian visitors just see the international price
 * as-is rather than a mislabeled/incorrect NGN number.
 */
export function resolvePrice(product: PriceableProduct, currency: Currency): { amount: number; currency: string } {
  if (currency === "NGN" && product.price_ngn != null) {
    return { amount: product.price_ngn, currency: "NGN" };
  }
  return { amount: product.price, currency: product.currency };
}
