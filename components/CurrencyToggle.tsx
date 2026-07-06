"use client";

import { useRouter } from "next/navigation";
import { CURRENCY_COOKIE_NAME, type Currency } from "@/lib/currency-shared";

export default function CurrencyToggle({ current }: { current: Currency }) {
  const router = useRouter();

  function setCurrency(currency: Currency) {
    document.cookie = `${CURRENCY_COOKIE_NAME}=${currency}; path=/; max-age=${60 * 60 * 24 * 365}`;
    router.refresh();
  }

  return (
    <div className="flex items-center gap-1 text-xs">
      {(["NGN", "USD"] as const).map((c) => (
        <button
          key={c}
          onClick={() => setCurrency(c)}
          className={`px-2 py-1 rounded-full border transition-colors ${
            current === c ? "bg-ink text-paper border-ink" : "border-ink/20 text-muted hover:border-ink/40"
          }`}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
