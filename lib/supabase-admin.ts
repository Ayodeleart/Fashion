import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://qmwlphribvncdtgzbixt.supabase.co";

// Server-only client (used in Server Actions / route handlers under app/admin).
// Requires SUPABASE_SERVICE_ROLE_KEY as an env var — this one bypasses
// RLS entirely, so unlike the URL/publishable key it does NOT get
// hardcoded here. Set it in Vercel -> Settings -> Environment Variables.
//
// Left untyped (no <Database> generic) deliberately — the hand-written
// Database type in types/database.ts documents the schema but isn't run
// through supabase-js's stricter generic inference. Swap in
// `supabase gen types typescript` output here for fully-typed queries.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY is not set. Add it in Vercel -> Settings -> Environment Variables (get the value from Supabase -> Project Settings -> API)."
    );
  }

  return createClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
