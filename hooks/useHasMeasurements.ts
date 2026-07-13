"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";

// Every product here is bespoke-tailored, so "AI Perfect Fit" isn't a
// per-product flag — it's true for every card once the signed-in customer
// has a completed measurement profile. One query per page load, not per card.
export function useHasMeasurements() {
  const [hasMeasurements, setHasMeasurements] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    let cancelled = false;

    async function check(userId: string | null) {
      if (!userId) {
        if (!cancelled) setHasMeasurements(false);
        return;
      }
      const { data } = await supabase
        .from("ariana_customer_measurements")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();
      if (!cancelled) setHasMeasurements(!!data);
    }

    supabase.auth.getUser().then(({ data }) => check(data.user?.id ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      check(session?.user?.id ?? null);
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  return hasMeasurements;
}
