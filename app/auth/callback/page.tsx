"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    // supabase-js's browser client has detectSessionInUrl: true by
    // default, so it processes the ?code=... param on init. We just
    // wait for the resulting SIGNED_IN event (or an already-resolved
    // session) and then move on.
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        sessionStorage.setItem("ariana_just_signed_in", "1");
        router.replace("/catalog");
      }
      if (event === "SIGNED_OUT") {
        setError("Sign-in did not complete. Please try again.");
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) setError(error.message);
      if (data.session) {
        sessionStorage.setItem("ariana_just_signed_in", "1");
        router.replace("/catalog");
      }
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-paper px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl mb-2">Signing you in…</h1>
        <p className="text-sm text-muted">{error ?? "One moment."}</p>
      </div>
    </main>
  );
}
