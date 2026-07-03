import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { verifyWebhookSignature } from "@/lib/paystack";

/**
 * Paystack webhook. Configure this URL in your Paystack dashboard under
 * Settings -> API Keys & Webhooks once you have live/test keys:
 *   https://yourdomain.com/api/webhooks/paystack
 *
 * We read the raw text body (not req.json()) because signature
 * verification needs the exact bytes Paystack signed — parsing to JSON
 * first and re-stringifying can produce a different byte sequence and
 * silently break verification.
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "charge.success") {
    const reference = event.data?.reference; // this is our ariana_orders.id
    if (reference) {
      const admin = createAdminClient();
      const { error } = await admin
        .from("ariana_orders")
        .update({ status: "paid" })
        .eq("id", reference);

      if (error) {
        // Log but still return 200 — Paystack will retry on non-2xx,
        // and a DB hiccup shouldn't cause repeated duplicate retries
        // to pile up indefinitely. Surface this in server logs instead.
        console.error("Failed to mark order paid:", error.message);
      }
    }
  }

  // Always acknowledge receipt so Paystack doesn't keep retrying events
  // we've already handled (or intentionally ignored, like other event types).
  return NextResponse.json({ received: true });
}
