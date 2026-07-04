"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteHeroLookButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this hero look? This can't be undone.")) return;
    setPending(true);
    try {
      const res = await fetch(`/api/admin/hero?id=${id}`, { method: "DELETE" });
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
      onClick={handleDelete}
      disabled={pending}
      className="text-xs text-red-700 hover:underline disabled:opacity-50 mt-1"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
