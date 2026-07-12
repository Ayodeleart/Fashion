"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "@/lib/webpush-public";
import ProfilePlaceholderIcon from "@/components/ProfilePlaceholderIcon";
import { useCart } from "@/components/CartProvider";

export default function TopBar() {
  const { count } = useCart();
  const [name, setName] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setSignedIn(true);
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("ariana_customer_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setName(profile?.display_name ?? data.user.email?.split("@")[0] ?? null);
      setAvatarUrl(profile?.avatar_url ?? null);
    });

    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.ready.then(async (reg) => {
        const existing = await reg.pushManager.getSubscription();
        setSubscribed(!!existing);
      });
    }
  }, []);

  async function toggleNotifications() {
    if (busy) return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      alert("Push notifications aren't supported on this browser.");
      return;
    }
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;

      if (subscribed) {
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: existing.endpoint }),
          });
          await existing.unsubscribe();
        }
        setSubscribed(false);
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setBusy(false);
        return;
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const json = sub.toJSON();
      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys, userId }),
      });
      setSubscribed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-4">
      <Link href={signedIn ? "/account/profile" : "/account/login"} className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-full bg-paper-raised border border-ink/10 overflow-hidden flex items-center justify-center shrink-0 text-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ProfilePlaceholderIcon className="w-6 h-6" />
          )}
        </div>
        <div>
          <p className="text-base font-medium leading-tight">
            {signedIn ? `Hi, ${name ?? "there"}` : "Hi, welcome"}
          </p>
          <p className="text-xs text-muted leading-tight">Always be style</p>
        </div>
      </Link>

      <div className="flex items-center gap-3">
        <Link
          href="/cart"
          aria-label={`Cart${count > 0 ? `, ${count} item${count === 1 ? "" : "s"}` : ""}`}
          className="relative w-9 h-9 rounded-full bg-paper-raised flex items-center justify-center shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M6.5 8.5h11l1 12.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5L6.5 8.5Z"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinejoin="round"
            />
            <path d="M9 8.5V6.8a3 3 0 0 1 6 0V8.5" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-brass text-ink text-[10px] font-medium rounded-full w-5 h-5 flex items-center justify-center">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Link>
        <button
          type="button"
          onClick={toggleNotifications}
          aria-label={subscribed ? "Turn off notifications" : "Turn on notifications"}
          aria-pressed={subscribed}
          disabled={busy}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 ${
            subscribed ? "bg-brass text-ink" : "bg-paper-raised"
          }`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14.8728 19.4434C14.8728 19.7467 14.7952 20.0471 14.6445 20.3274C14.4937 20.6077 14.2728 20.8623 13.9943 21.0769C13.7157 21.2914 13.385 21.4615 13.0211 21.5776C12.6572 21.6937 12.2671 21.7535 11.8732 21.7535C11.4793 21.7535 11.0893 21.6937 10.7253 21.5776C10.3614 21.4615 10.0307 21.2914 9.75221 21.0769C9.47368 20.8623 9.25273 20.6077 9.10199 20.3274C8.95124 20.0471 8.87366 19.7467 8.87366 19.4434" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
            <path d="M19.6147 13.1897L19.8793 13.7605C20.8888 15.9374 19.5741 18.4819 17.2145 18.918L17.0543 18.9476C13.6293 19.5807 10.1172 19.5807 6.69218 18.9476C4.31327 18.5079 3.05472 15.876 4.20588 13.7483L4.43229 13.3298C5.05046 12.1872 5.37418 10.9085 5.37418 9.60942L5.37418 8.28813C5.37418 6.06434 6.63282 4.03213 8.62372 3.04138C10.678 2.0191 13.0852 1.98433 15.1681 2.94684L15.3728 3.04138C17.5063 4.02726 18.8723 6.16325 18.8723 8.51353L18.8723 9.82416C18.8723 10.9866 19.1256 12.1351 19.6147 13.1897Z" stroke="currentColor" strokeWidth={1.5} />
            <path d="M9.49707 14.4995L14.4971 14.4995" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
