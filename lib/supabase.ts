import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client for use in Client Components / the browser. Never put the
// service role key here — that stays server-side only (lib/supabase-admin.ts).
//
// Left untyped (no <Database> generic) — see the note in supabase-admin.ts.
export const supabase = createClient(url, anonKey);
