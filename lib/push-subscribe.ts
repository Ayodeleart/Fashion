import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/webpush-public";

export type PushSubscribeResult = "subscribed" | "denied" | "unsupported" | "error";

export async function subscribeToPush(userId: string | null): Promise<PushSubscribeResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return "unsupported";
  }

  try {
    const reg = await navigator.serviceWorker.ready;

    const existing = await reg.pushManager.getSubscription();
    if (existing) return "subscribed";

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return "denied";

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
    });
    const json = sub.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userId }),
    });
    if (!res.ok) return "error";

    return "subscribed";
  } catch {
    return "error";
  }
}
