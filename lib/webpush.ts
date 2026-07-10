import webpush from "web-push";

// Public key is safe to ship client-side by design (same convention as
// the Supabase publishable key in lib/supabase.ts) — kept in sync with
// lib/webpush-public.ts, which is the client-importable copy. Private
// key is genuinely secret and stays server-only, via env var.
const VAPID_PUBLIC_KEY = "BERe9PaZxK_8m5HY4fqmzJrDcjXd5jDrcgrV8GTiiWC_HXWVKXM-li-jHId_oJ9CE73EYlxTQPhlAOlG_4NdgHw";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("VAPID_PRIVATE_KEY is not set.");
  }
  webpush.setVapidDetails("mailto:Ayodeleart1@gmail.com", VAPID_PUBLIC_KEY, privateKey);
  configured = true;
}

export type PushSubscriptionRow = {
  id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
};

export async function sendPush(sub: PushSubscriptionRow, payload: { title: string; body: string; url?: string }) {
  ensureConfigured();
  return webpush.sendNotification(
    {
      endpoint: sub.endpoint,
      keys: { p256dh: sub.p256dh, auth: sub.auth_key },
    },
    JSON.stringify(payload)
  );
}
