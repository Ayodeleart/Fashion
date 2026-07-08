"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { getSupabase } from "@/lib/supabase";

export type CartItem = {
  productId: string;
  variantId: string | null;
  size: string | null;
  name: string;
  price: number;
  currency: string;
  image: string;
  quantity: number;
};

type AddResult = { requiresAuth: boolean; error?: string };

type CartContextValue = {
  items: CartItem[];
  loading: boolean;
  signedIn: boolean;
  addItem: (item: Omit<CartItem, "quantity" | "variantId" | "size"> & { variantId?: string | null; size?: string | null }, quantity?: number) => Promise<AddResult>;
  removeItem: (productId: string, variantId?: string | null) => Promise<void>;
  setQuantity: (productId: string, quantity: number, variantId?: string | null) => Promise<void>;
  clear: () => Promise<void>;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

type CartRow = {
  product_id: string;
  variant_id: string | null;
  size: string | null;
  name: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
};

function rowToItem(row: CartRow): CartItem {
  return {
    productId: row.product_id,
    variantId: row.variant_id,
    size: row.size,
    name: row.name,
    price: row.price,
    currency: row.currency,
    image: row.image ?? "",
    quantity: row.quantity,
  };
}

function sameLine(item: { productId: string; variantId?: string | null }, productId: string, variantId?: string | null) {
  return item.productId === productId && (item.variantId ?? null) === (variantId ?? null);
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
      .select("product_id, variant_id, size, name, price, currency, image, quantity")
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

  const addItem = useCallback(
    async (
      item: Omit<CartItem, "quantity" | "variantId" | "size"> & { variantId?: string | null; size?: string | null },
      quantity = 1
    ): Promise<AddResult> => {
      const userId = userIdRef.current;
      if (!userId) return { requiresAuth: true };

      const variantId = item.variantId ?? null;
      const size = item.size ?? null;
      const supabase = getSupabase();
      const existing = items.find((i) => sameLine(i, item.productId, variantId));

      if (existing) {
        const newQty = existing.quantity + quantity;
        let query = supabase
          .from("ariana_cart_items")
          .update({ quantity: newQty, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("product_id", item.productId);
        query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
        const { error } = await query;
        if (error) {
          console.error("Cart update failed:", error.message);
          return { requiresAuth: false, error: error.message };
        }
        setItems((prev) => prev.map((i) => (sameLine(i, item.productId, variantId) ? { ...i, quantity: newQty } : i)));
      } else {
        const { error } = await supabase.from("ariana_cart_items").insert({
          user_id: userId,
          product_id: item.productId,
          variant_id: variantId,
          size,
          name: item.name,
          price: item.price,
          currency: item.currency,
          image: item.image,
          quantity,
        });
        if (error) {
          console.error("Add to cart failed:", error.message);
          return { requiresAuth: false, error: error.message };
        }
        setItems((prev) => [...prev, { ...item, variantId, size, quantity }]);
      }

      return { requiresAuth: false };
    },
    [items]
  );

  const removeItem = useCallback(async (productId: string, variantId: string | null = null) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const supabase = getSupabase();
    let query = supabase.from("ariana_cart_items").delete().eq("user_id", userId).eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { error } = await query;
    if (error) {
      console.error("Remove from cart failed:", error.message);
      return;
    }
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
  }, []);

  const setQuantity = useCallback(async (productId: string, quantity: number, variantId: string | null = null) => {
    const userId = userIdRef.current;
    if (!userId) return;
    const supabase = getSupabase();

    if (quantity <= 0) {
      let delQuery = supabase.from("ariana_cart_items").delete().eq("user_id", userId).eq("product_id", productId);
      delQuery = variantId ? delQuery.eq("variant_id", variantId) : delQuery.is("variant_id", null);
      const { error } = await delQuery;
      if (error) {
        console.error("Remove from cart failed:", error.message);
        return;
      }
      setItems((prev) => prev.filter((i) => !sameLine(i, productId, variantId)));
      return;
    }

    let query = supabase
      .from("ariana_cart_items")
      .update({ quantity, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("product_id", productId);
    query = variantId ? query.eq("variant_id", variantId) : query.is("variant_id", null);
    const { error } = await query;
    if (error) {
      console.error("Update cart quantity failed:", error.message);
      return;
    }
    setItems((prev) => prev.map((i) => (sameLine(i, productId, variantId) ? { ...i, quantity } : i)));
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
