"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

export type SavedItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  href: string;
};

type SavedContextValue = {
  items: SavedItem[];
  isSaved: (productId: string) => boolean;
  toggle: (item: SavedItem) => void;
};

const SavedContext = createContext<SavedContextValue | null>(null);
const STORAGE_KEY = "ariana_saved_v1";

function readStoredSaved(): SavedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>(() => readStoredSaved());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const isSaved = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggle = useCallback((item: SavedItem) => {
    setItems((prev) =>
      prev.some((i) => i.productId === item.productId)
        ? prev.filter((i) => i.productId !== item.productId)
        : [...prev, item]
    );
  }, []);

  return <SavedContext.Provider value={{ items, isSaved, toggle }}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
