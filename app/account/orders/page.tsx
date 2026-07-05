"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Order = {
  id: string;
  status: string;
  total: number;
  currency: string;
  created_at: string;
};

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-blue-50 text-blue-700",
  cancelled: "bg-red-50 text-red-700",
};

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/account/login?next=/account/orders");
        return;
      }
      const { data: rows } = await supabase
        .from("ariana_orders")
        .select("id, status, total, currency, created_at")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });
      setOrders(rows ?? []);
      setLoading(false);
    });
  }, [router]);

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Order History</h1>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-sm text-muted mb-6">No orders yet.</p>
          <a href="/catalog" className="inline-block bg-ink text-paper text-sm rounded-full px-5 py-2.5">
            Start shopping
          </a>
        </div>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li key={order.id} className="bg-paper-raised rounded-2xl p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Order #{order.id.slice(0, 8)}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusStyles[order.status] ?? "bg-paper text-muted"}`}>
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-muted mb-2">
                {new Date(order.created_at).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}
              </p>
              <p className="text-sm">{formatPrice(order.total, order.currency)}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
