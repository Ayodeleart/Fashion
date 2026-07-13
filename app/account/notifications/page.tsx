"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/webpush-public";

function Toggle({ on, onClick, disabled }: { on: boolean; onClick: () => void; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-11 h-6 rounded-full relative transition-colors disabled:opacity-50 ${on ? "bg-ink" : "bg-ink/20"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-paper transition-transform ${on ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

export default function NotificationsPage() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newArrivals, setNewArrivals] = useState(false);

  // This is the real signal, moved here from the top bar bell — whether
  // this device is actually subscribed to browser push.
  const [userId, setUserId] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      });
    }
  }, []);

  async function togglePush() {
    if (busy) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported on this browser.");
      return;
    }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: existing.endpoint }),
          });
          await existing.unsubscribe();
        }
        setSubscribed(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setBusy(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userId }),
      });
      setSubscribed(true);
    } finally {
      setBusy(false);
    }
  }

  const preferenceRows = [
    { label: "Order updates", value: orderUpdates, set: setOrderUpdates },
    { label: "Promotions & discounts", value: promotions, set: setPromotions },
    { label: "New arrivals", value: newArrivals, set: setNewArrivals },
  ];

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Notifications</h1>

      <div className="bg-paper-raised rounded-2xl mb-4">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-sm">Push notifications</p>
            <p className="text-xs text-muted mt-0.5">
              {subscribed ? "On for this device" : "Off for this device"}
            </p>
          </div>
          <Toggle on={subscribed} onClick={togglePush} disabled={busy} />
        </div>
      </div>

      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5">
        {preferenceRows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm">{row.label}</span>
            <Toggle on={row.value} onClick={() => row.set((v) => !v)} />
          </div>
        ))}
      </div>
    </main>
  );
}
