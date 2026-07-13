"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { login } from "./actions";

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from");
  const error = searchParams.get("error");
  const [googlePending, setGooglePending] = useState(false);

  async function handleGoogleSignIn() {
    setGooglePending(true);
    await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/admin/auth/callback` },
    });
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <p className="font-display text-2xl text-paper mb-1">
          AYODELE<span className="text-brass">GOLD</span>
        </p>
        <p className="text-sm text-paper/50 mb-8">Admin sign in</p>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={googlePending}
          className="w-full flex items-center justify-center gap-2 bg-paper text-ink text-sm py-2.5 rounded mb-6 disabled:opacity-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          {googlePending ? "Redirecting…" : "Sign in with Google"}
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-paper/10" />
          <span className="text-xs text-paper/40">or</span>
          <div className="flex-1 h-px bg-paper/10" />
        </div>

        <form action={login}>
          <input type="hidden" name="from" value={from ?? "/admin"} />

          {error === "invalid" && (
            <p className="text-sm text-red-400 bg-red-950/40 border border-red-900 rounded p-3 mb-5">
              Incorrect username or password.
            </p>
          )}

          <div className="mb-4">
            <label className="block text-sm text-paper/70 mb-1">Username</label>
            <input
              name="username"
              required
              autoComplete="username"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              className="w-full border border-paper/20 bg-transparent text-paper rounded px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm text-paper/70 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-paper/20 bg-transparent text-paper rounded px-3 py-2 text-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full border border-paper/20 text-paper/70 text-sm py-2.5 rounded hover:bg-paper/5 transition-colors"
          >
            Sign in with password instead
          </button>
        </form>
      </div>
    </main>
  );
}
