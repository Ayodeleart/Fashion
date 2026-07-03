import { createAdminClient } from "@/lib/supabase-admin";

export default async function AdminOrdersPage() {
  let orders: { id: string; customer_email: string; total: number; currency: string; status: string; created_at: string }[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("orders")
      .select("id, customer_email, total, currency, status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    orders = data ?? [];
  } catch (err) {
    loadError = err instanceof Error ? err.message : "Could not load orders.";
  }

  return (
    <div>
      <h1 className="font-display text-3xl mb-6">Orders</h1>

      {loadError && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 mb-6">
          {loadError}
        </p>
      )}

      {!loadError && orders.length === 0 && <p className="text-sm text-muted">No orders yet.</p>}

      {orders.length > 0 && (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-muted border-b border-ink/10">
              <th className="py-2 font-normal">Customer</th>
              <th className="py-2 font-normal">Total</th>
              <th className="py-2 font-normal">Status</th>
              <th className="py-2 font-normal">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-ink/5">
                <td className="py-3">{o.customer_email}</td>
                <td className="py-3">{o.currency} {o.total}</td>
                <td className="py-3 capitalize">{o.status}</td>
                <td className="py-3">{new Date(o.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
