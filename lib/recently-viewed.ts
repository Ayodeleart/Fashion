const KEY = "ariana_recently_viewed";
const MAX = 12;

export type RecentlyViewedItem = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  category: string | null;
  image: string;
  viewedAt: number;
};

export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as RecentlyViewedItem[]) : [];
  } catch {
    return [];
  }
}

export function trackRecentlyViewed(item: Omit<RecentlyViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  const existing = getRecentlyViewed().filter((i) => i.id !== item.id);
  const next = [{ ...item, viewedAt: Date.now() }, ...existing].slice(0, MAX);
  window.localStorage.setItem(KEY, JSON.stringify(next));
}
