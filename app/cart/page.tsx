"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useCart } from "@/components/CartProvider";
import { getSupabase } from "@/lib/supabase";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function CartPage() {
  const router = useRouter();
  const { items, setQuantity, removeItem, total } = useCart();
  const [email, setEmail] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getSupabase()
      .auth.getUser()
      .then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);

  async function handleCheckout() {
    if (!email) {
      router.push("/account/login?next=/cart");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          currency: items[0]?.currency ?? "NGN",
          items: items.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            unit_price: i.price,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setPending(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="px-5 py-16 text-center">
        <h1 className="font-display text-2xl mb-2">Your cart is empty</h1>
        <p className="text-sm text-muted mb-6">Add something you love from the catalog.</p>
        <a href="/catalog" className="inline-block bg-ink text-paper text-sm rounded-full px-5 py-2.5">
          Browse catalog
        </a>
      </main>
    );
  }

  return (
    <main className="px-5 py-8">
      <h1 className="font-display text-2xl mb-6">Your cart</h1>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 mb-4">{error}</p>
      )}

      <ul className="space-y-4 mb-8">
        {items.map((item) => (
          <li key={item.productId} className="flex gap-3">
            <div className="relative w-16 h-20 rounded-xl overflow-hidden bg-paper-raised shrink-0">
              {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{item.name}</p>
              <p className="text-sm text-muted">{formatPrice(item.price, item.currency)}</p>
              <div className="flex items-center gap-2 mt-1">
                <button
                  onClick={() => setQuantity(item.productId, item.quantity - 1)}
                  className="w-7 h-7 rounded-full border border-ink/20 text-sm"
                >
                  −
                </button>
                <span className="text-sm w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => setQuantity(item.productId, item.quantity + 1)}
                  className="w-7 h-7 rounded-full border border-ink/20 text-sm"
                >
                  +
                </button>
                <button
                  onClick={() => removeItem(item.productId)}
                  className="text-xs text-muted ml-2 underline"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between mb-4 text-sm">
        <span className="text-muted">Total</span>
        <span className="font-medium">{formatPrice(total, items[0]?.currency ?? "NGN")}</span>
      </div>

      <button
        onClick={handleCheckout}
        disabled={pending}
        className="w-full bg-ink text-paper rounded-full px-4 py-3 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
      >
        {pending ? "Redirecting to Paystack…" : email ? "Checkout with Paystack" : "Sign in to checkout"}
      </button>
    </main>
  );
}
