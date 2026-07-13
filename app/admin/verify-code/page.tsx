"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function VerifyCodePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (!data.session) {
          router.replace("/admin/login");
          return;
        }
        setCheckingSession(false);
      });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    try {
      const { data } = await getSupabase().auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        router.replace("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, accessToken }),
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
        return;
      }
      router.replace("/admin");
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setPending(false);
    }
  }

  if (checkingSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink px-6">
        <p className="text-sm text-paper/50">One moment…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="font-display text-2xl text-paper mb-1">
          AYODELE<span className="text-brass">GOLD</span>
        </p>
        <p className="text-sm text-paper/50 mb-8">Enter your access code</p>

        {error && (
          <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded p-3 mb-5">{error}</p>
        )}

        <div className="mb-6">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            autoFocus
            inputMode="numeric"
            placeholder="Code"
            className="w-full border border-paper/20 bg-transparent text-paper rounded px-3 py-2 text-sm tracking-widest text-center"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brass text-ink text-sm py-2.5 rounded hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </main>
  );
}
