import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { initializeTransaction } from "@/lib/paystack";

type CheckoutItem = {
  product_id: string;
  variant_id?: string;
  quantity: number;
  unit_price: number; // in the store's display currency (e.g. NGN naira, not kobo)
};

type CheckoutBody = {
  email: string;
  items: CheckoutItem[];
  currency?: string;
};

export async function POST(req: NextRequest) {
  let body: CheckoutBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { email, items, currency = "NGN" } = body;

  if (!email || !items?.length) {
    return NextResponse.json({ error: "email and at least one item are required." }, { status: 400 });
  }

  const total = items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
  if (total <= 0) {
    return NextResponse.json({ error: "Order total must be greater than zero." }, { status: 400 });
  }

  const admin = createAdminClient();

  // 1. Create the order as 'pending' before redirecting to Paystack —
  //    this way even an abandoned checkout leaves a record, and the
  //    webhook has a real order row to reconcile against by reference.
  const { data: order, error: orderErr } = await admin
    .from("ariana_orders")
    .insert({
      customer_email: email,
      status: "pending",
      payment_provider: "paystack",
      total,
      currency,
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return NextResponse.json(
      { error: orderErr?.message ?? "Could not create order." },
      { status: 500 }
    );
  }

  const { error: itemsErr } = await admin.from("ariana_order_items").insert(
    items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id ?? null,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }))
  );

  if (itemsErr) {
    return NextResponse.json({ error: itemsErr.message }, { status: 500 });
  }

  // 2. Initialize the Paystack transaction. Amount must be in kobo
  //    (smallest unit) — multiply naira by 100. Reference = order id,
  //    so the webhook can find and update the exact order.
  try {
    const origin = req.nextUrl.origin;
    const transaction = await initializeTransaction({
      email,
      amountKobo: Math.round(total * 100),
      currency,
      reference: order.id,
      callbackUrl: `${origin}/checkout/complete?order_id=${order.id}`,
    });

    return NextResponse.json({ authorization_url: transaction.authorization_url, order_id: order.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Paystack initialization failed." },
      { status: 502 }
    );
  }
}
