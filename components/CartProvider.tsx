"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
};

type AddResult = { requiresAuth: boolean };

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  signedIn: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => Promise<AddResult>;
  removeItem: (productId: string) => Promise<void>;
  setQuantity: (productId: string, quantity: number) => Promise<void>;
  clear: () => Promise<void>;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartRow = {
  product_id: string;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
};

function rowToItem(row: CartRow): CartItem {
  return {
    productId: row.product_id,
    name: row.name,
    price: row.price,
    currency: row.currency,
    image: row.image ?? "",
    quantity: row.quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const userIdRef = useRef<string | null>(null);

  const loadCart = useCallback(async (userId: string | null) => {
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
      .from("ariana_cart_items")
      .select("product_id, name, price, currency, image, quantity")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });
    setItems(((data as CartRow[]) ?? []).map(rowToItem));
    setLoading(false);
  }, []);

  useEffect(() => {
    const supabase = getSupabase();

    supabase.auth.getUser().then(({ data }) => loadCart(data.user?.id ?? null));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadCart(session?.user?.id ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, [loadCart]);

  const addItem = useCallback(async (item: Omit<CartItem, "quantity">, quantity = 1): Promise<AddResult> => {
    const userId = userIdRef.current;
    if (!userId) return { requiresAuth: true };

    const supabase = getSupabase();
    const existing = items.find((i) => i.productId === item.productId);

    if (existing) {
      const newQty = existing.quantity + quantity;
      await supabase
        .from("ariana_cart_items")
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("product_id", item.productId);
      setItems((prev) => prev.map((i) => (i.productId === item.productId ? { ...i, quantity: newQty } : i)));
    } else {
      await supabase.from("ariana_cart_items").insert({
        user_id: userId,
        product_id: item.productId,
        name: item.name,
        price: item.price,
        currency: item.currency,
        image: item.image,
        quantity,
      });
      setItems((prev) => [...prev, { ...item, quantity }]);
    }

    return { requiresAuth: false };
  }, [items]);

  const removeItem = useCallback(async (productId: string) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const supabase = getSupabase();
    await supabase.from("ariana_cart_items").delete().eq("user_id", userId).eq("product_id", productId);
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const supabase = getSupabase();

    if (quantity <= 0) {
      await supabase.from("ariana_cart_items").delete().eq("user_id", userId).eq("product_id", productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
      return;
    }

    await supabase
      .from("ariana_cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("product_id", productId);
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }, []);

  const clear = useCallback(async () => {
    const userId = userIdRef.current;
    if (!userId) return;
    const supabase = getSupabase();
    await supabase.from("ariana_cart_items").delete().eq("user_id", userId);
    setItems([]);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, loading, signedIn, addItem, removeItem, setQuantity, clear, total, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
