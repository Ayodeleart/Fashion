import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Client for use in Client Components / the browser. Never put the
// service role key here — that stays server-side only (lib/supabase-admin.ts).
//
// Lazily instantiated (not created at module load) — Next.js evaluates
// client-component modules during the server build/prerender pass too,
// and an eager `createClient(undefined, undefined)` throws
// "supabaseUrl is required" and fails the whole build if env vars
// aren't set yet in the deploy environment (e.g. Vercel project settings).
let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Supabase env vars are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your deploy environment."
    );
  }

  client = createClient(url, anonKey);
  return client;
}
