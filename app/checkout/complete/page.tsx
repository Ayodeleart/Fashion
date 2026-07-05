import { verifyTransaction } from "@/lib/paystack";
import { createAdminClient } from "@/lib/supabase-admin";
import ClearCartOnSuccess from "@/components/ClearCartOnSuccess";

export const dynamic = "force-dynamic";

export default async function CheckoutCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ order_id?: string; reference?: string }>;
}) {
  const { order_id, reference } = await searchParams;
  const ref = reference ?? order_id;

  if (!ref) {
    return <Message title="Missing order reference" body="No order reference was provided." />;
  }

  try {
    const result = await verifyTransaction(ref);

    // Fallback reconciliation: the webhook is the source of truth and
    // usually lands first, but if it's delayed we still confirm here so
    // the customer isn't stuck looking at a "pending" page after paying.
    if (result.status === "success") {
      const admin = createAdminClient();
      await admin.from("ariana_orders").update({ status: "paid" }).eq("id", ref);

      return (
        <>
          <ClearCartOnSuccess />
          <Message
            title="Payment received"
            body="Thank you — your order is confirmed. A receipt has been sent to your email."
          />
        </>
      );
    }

    return (
      <Message
        title="Payment not completed"
        body={`Transaction status: ${result.status}. If you believe this is an error, contact support with order ${ref}.`}
      />
    );
  } catch (err) {
    return (
      <Message
        title="Couldn't verify payment"
        body={err instanceof Error ? err.message : "Something went wrong verifying this transaction."}
      />
    );
  }
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-3xl mb-3">{title}</h1>
        <p className="text-muted">{body}</p>
      </div>
    </main>
  );
}
