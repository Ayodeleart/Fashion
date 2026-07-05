"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";

export default function TopBar() {
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setSignedIn(true);
      const { data: profile } = await supabase
        .from("ariana_customer_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setName(profile?.display_name ?? data.user.email?.split("@")[0] ?? null);
      setAvatarUrl(profile?.avatar_url ?? null);
    });
  }, []);

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      <Link href={signedIn ? "/account/profile" : "/account/login"} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-paper-raised border border-ink/10 overflow-hidden flex items-center justify-center shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-muted">{(name ?? "?").slice(0, 1).toUpperCase()}</span>
          )}
        </div>
        <div>
          <p className="text-base font-medium leading-tight">
            {signedIn ? `Hi, ${name ?? "there"}` : "Hi, welcome"}
          </p>
          <p className="text-xs text-muted leading-tight">Always be style</p>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Notifications"
        className="w-9 h-9 rounded-full bg-paper-raised flex items-center justify-center shrink-0"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
          <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
