import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// These are public by design — the whole point of the "publishable" key
// is that it's safe to ship in client bundles (RLS is what actually
// protects the data, not secrecy of this key). Hardcoded here since this
// project is worked on from mobile, where setting env vars per-deploy is
// friction. The service role key and Paystack secret key are NOT
// hardcoded anywhere — those stay as env-only (lib/supabase-admin.ts,
// lib/paystack.ts) since they bypass RLS / move money.
const SUPABASE_URL = "https://qmwlphribvncdtgzbixt.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_mFGaq4PY8uyTNQeebS1aCA_a_8zwW38";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return client;
}
