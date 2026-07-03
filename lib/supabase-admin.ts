import { createClient } from "@supabase/supabase-js";

// Server-only client (used in Server Actions / route handlers under app/admin).
// Requires SUPABASE_SERVICE_ROLE_KEY, which must never be prefixed with
// NEXT_PUBLIC_ and never shipped to the browser bundle.
//
// Left untyped (no <Database> generic) deliberately — the hand-written
// Database type in types/database.ts documents the schema but isn't run
// through supabase-js's stricter generic inference. Swap in
// `supabase gen types typescript` output here for fully-typed queries.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false },
  });
}
