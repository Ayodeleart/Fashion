"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import GoogleButton from "@/components/GoogleButton";

export default function AuthForm({ mode, glass }: { mode: "login" | "signup"; glass?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/catalog";
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

  const labelClass = glass ? "block text-sm mb-1 text-white/90" : "block text-sm mb-1";
  const inputClass = glass
    ? "liquid-glass-input w-full rounded-full px-4 py-3 text-sm outline-none"
    : "w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-paper";
  const dividerClass = glass ? "h-px flex-1 bg-white/25" : "h-px flex-1 bg-ink/10";
  const orTextClass = glass ? "text-xs text-white/70" : "text-xs text-muted";
  const footerTextClass = glass ? "text-sm text-white/80 text-center mt-6" : "text-sm text-muted text-center mt-6";
  const linkClass = glass ? "text-white underline" : "text-ink underline";

  return (
    <div className="w-full max-w-sm mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{error}</p>
        )}
        {info && (
          <p className={glass ? "text-sm text-white bg-white/15 border border-white/25 rounded p-3" : "text-sm text-ink bg-paper-raised border border-ink/10 rounded p-3"}>
            {info}
          </p>
        )}

        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
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
        <div className={dividerClass} />
        <span className={orTextClass}>or</span>
        <div className={dividerClass} />
      </div>

      <GoogleButton />

      <p className={footerTextClass}>
        {mode === "signup" ? (
          <>Already have an account? <a href="/account/login" className={linkClass}>Sign in</a></>
        ) : (
          <>New here? <a href="/account/signup" className={linkClass}>Create an account</a></>
        )}
      </p>
    </div>
  );
}
