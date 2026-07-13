"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AdminAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) router.replace("/admin/verify-code");
      if (event === "SIGNED_OUT") setError("Sign-in did not complete. Please try again.");
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      if (data.session) router.replace("/admin/verify-code");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl text-paper mb-2">Signing you in…</h1>
        <p className="text-sm text-paper/50">{error ?? "One moment."}</p>
        {error && (
          <a href="/admin/login" className="inline-block mt-4 text-sm text-brass underline">
            Back to sign in
          </a>
        )}
      </div>
    </main>
  );
}
