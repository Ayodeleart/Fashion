"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetDefaultBannerButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleClick() {
    setPending(true);
    try {
      const res = await fetch("/api/admin/hero", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, setDefault: true }),
      });
      const result: { error?: string } = await res.json();
      if (result.error) {
        alert(result.error);
        return;
      }
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="text-xs text-brass hover:underline disabled:opacity-50"
    >
      {pending ? "Setting…" : "Set as default"}
    </button>
  );
}
