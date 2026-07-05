"use client";

import { useState } from "react";

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-11 h-6 rounded-full relative transition-colors ${on ? "bg-ink" : "bg-ink/20"}`}
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

  const rows = [
    { label: "Order updates", value: orderUpdates, set: setOrderUpdates },
    { label: "Promotions & discounts", value: promotions, set: setPromotions },
    { label: "New arrivals", value: newArrivals, set: setNewArrivals },
  ];

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-6">Notifications</h1>
      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-4 py-3.5">
            <span className="text-sm">{row.label}</span>
            <Toggle on={row.value} onClick={() => row.set((v) => !v)} />
          </div>
        ))}
      </div>
    </main>
  );
}
