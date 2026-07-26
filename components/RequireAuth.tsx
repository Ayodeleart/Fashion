"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

export default function RequireAuth({ children, feature }: { children: React.ReactNode; feature: string }) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"checking" | "signed-in" | "signed-out">("checking");

  useEffect(() => {
    let active = true;
    const supabase = getSupabase();
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      // Any failure (including the normal "no session" case) is treated
      // as signed-out here — this gate fails closed rather than letting
      // an AI feature run when we're not sure who's asking.
      setStatus(data.user ? "signed-in" : "signed-out");
    });
    return () => {
      active = false;
    };
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 rounded-full border-2 border-brass border-t-transparent animate-spin" />
      </div>
    );
  }

  if (status === "signed-out") {
    const next = encodeURIComponent(pathname);
    return (
      <div className="flex flex-col items-center text-center gap-4 py-16 px-6">
        <p className="text-sm text-muted max-w-xs">Sign in to use {feature} — it&apos;s for account holders only.</p>
        <div className="flex gap-3">
          <Link
            href={`/account/login?next=${next}`}
            className="h-11 px-6 rounded-full bg-ink text-paper text-sm font-medium flex items-center justify-center"
          >
            Sign In
          </Link>
          <Link
            href={`/account/signup?next=${next}`}
            className="h-11 px-6 rounded-full border border-ink/15 text-sm font-medium flex items-center justify-center"
          >
            Sign Up
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
