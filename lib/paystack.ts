import crypto from "crypto";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function secretKey(): string {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new Error(
      "PAYSTACK_SECRET_KEY is not set. Add it to your environment once you have real Paystack API keys."
    );
  }
  return key;
}

type InitializeParams = {
  email: string;
  amountKobo: number; // Paystack expects the smallest currency unit (kobo for NGN)
  currency?: string; // NGN by default; Paystack also supports USD/GHS/ZAR/KES on some accounts
  reference: string; // should match your ariana_orders.id so the webhook can reconcile it
  callbackUrl: string;
};

export async function initializeTransaction(params: InitializeParams) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: params.email,
      amount: params.amountKobo,
      currency: params.currency ?? "NGN",
      reference: params.reference,
      callback_url: params.callbackUrl,
    }),
  });

  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message ?? "Paystack transaction initialization failed.");
  }

  return data.data as { authorization_url: string; access_code: string; reference: string };
}

export async function verifyTransaction(reference: string) {
  const res = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${secretKey()}` },
  });
  const data = await res.json();
  if (!res.ok || !data.status) {
    throw new Error(data.message ?? "Paystack transaction verification failed.");
  }
  return data.data as { status: string; reference: string; amount: number; currency: string };
}

/**
 * Paystack signs webhook payloads with HMAC SHA512 of the raw body, using
 * your secret key. Always verify this before trusting a webhook — anyone
 * can POST to a guessable webhook URL otherwise.
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const hash = crypto.createHmac("sha512", secretKey()).update(rawBody).digest("hex");
  return hash === signatureHeader;
}
