// Single source of truth for product categories — used in the new/edit
// admin forms as a <select>, so products actually get categorized
// consistently instead of free-typed text that can't be filtered on
// reliably (e.g. "Top" vs "Tops" vs "top" all meaning the same thing).
export const PRODUCT_CATEGORIES = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];
