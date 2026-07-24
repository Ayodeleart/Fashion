"use client";

import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import { subscribeToPush } from "@/lib/push-subscribe";

const FLAG_KEY = "ariana_just_signed_in";

export default function AutoPushPrompt() {
  useEffect(() => {
    if (sessionStorage.getItem(FLAG_KEY) !== "1") return;
    sessionStorage.removeItem(FLAG_KEY);

    getSupabase()
      .auth.getUser()
      .then(({ data }) => {
        // Fire and forget — if the person dismisses the native browser
        // permission dialog, subscribeToPush just resolves to "denied"
        // and nothing else happens. No UI of our own to manage here.
        subscribeToPush(data.user?.id ?? null);
      });
  }, []);

  return null;
}
