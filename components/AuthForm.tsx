"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import GoogleButton from "@/components/GoogleButton";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setInfo(null);

    const supabase = getSupabase();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setPending(false);
        return;
      }
      if (data.session) {
        sessionStorage.setItem("ariana_just_signed_in", "1");
        router.push(next);
      } else {
        setInfo("Check your email to confirm your account, then sign in.");
        setPending(false);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setPending(false);
      return;
    }
    sessionStorage.setItem("ariana_just_signed_in", "1");
    router.push(next);
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}
        {info && (
          <p className="text-sm text-ink bg-paper-raised border border-ink/10 rounded p-3">{info}</p>
        )}

        <div>
          <label className="block text-sm mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-paper rounded-full px-4 py-3 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {pending ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
        </button>
      </form>

      <div className="flex items-center gap-3 my-5">
        <div className="h-px flex-1 bg-ink/10" />
        <span className="text-xs text-muted">or</span>
        <div className="h-px flex-1 bg-ink/10" />
      </div>

      <GoogleButton />

      <p className="text-sm text-muted text-center mt-6">
        {mode === "signup" ? (
          <>Already have an account? <a href="/account/login" className="text-ink underline">Sign in</a></>
        ) : (
          <>New here? <a href="/account/signup" className="text-ink underline">Create an account</a></>
        )}
      </p>
    </div>
  );
}
