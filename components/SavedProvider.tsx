"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";

export type SavedItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  href: string;
};

type ToggleResult = { requiresAuth: boolean };

type SavedContextValue = {
  items: SavedItem[];
  loading: boolean;
  signedIn: boolean;
  isSaved: (productId: string) => boolean;
  toggle: (item: SavedItem) => Promise<ToggleResult>;
};

const SavedContext = createContext<SavedContextValue | null>(null);

type SavedRow = {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  href: string | null;
};

function rowToItem(row: SavedRow): SavedItem {
  return {
    productId: row.product_id,
    name: row.name,
    price: row.price,
    currency: row.currency,
    image: row.image ?? "",
    href: row.href ?? "",
  };
}

export function SavedProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const loadSaved = useCallback(async (userId: string | null) => {
    userIdRef.current = userId;
    if (!userId) {
      setItems([]);
      setSignedIn(false);
      setLoading(false);
      return;
    }
    setSignedIn(true);
    const supabase = getSupabase();
    const { data } = await supabase
      .from("ariana_saved_items")
      .select("product_id, name, price, currency, image, href")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    setItems(((data as SavedRow[]) ?? []).map(rowToItem));
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data }) => loadSaved(data.user?.id ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadSaved(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadSaved]);

  const isSaved = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  const toggle = useCallback(async (item: SavedItem): Promise<ToggleResult> => {
    const userId = userIdRef.current;
    if (!userId) return { requiresAuth: true };

    const supabase = getSupabase();
    const alreadySaved = items.some((i) => i.productId === item.productId);

    if (alreadySaved) {
      await supabase.from("ariana_saved_items").delete().eq("user_id", userId).eq("product_id", item.productId);
      setItems((prev) => prev.filter((i) => i.productId !== item.productId));
    } else {
      await supabase.from("ariana_saved_items").insert({
        user_id: userId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        currency: item.currency,
        image: item.image,
        href: item.href,
      });
      setItems((prev) => [...prev, item]);
    }

    return { requiresAuth: false };
  }, [items]);

  return (
    <SavedContext.Provider value={{ items, loading, signedIn, isSaved, toggle }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
