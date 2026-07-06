"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import ProfilePlaceholderIcon from "@/components/ProfilePlaceholderIcon";

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-muted shrink-0">
      <path d="m9 6 6 6-6 6" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Row({ href, icon, title, subtitle }: { href: string; icon: React.ReactNode; title: string; subtitle?: string }) {
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-full bg-paper flex items-center justify-center text-ink shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm">{title}</p>
        {subtitle && <p className="text-xs text-muted">{subtitle}</p>}
      </div>
      <ChevronRight />
    </a>
  );
}

const icons = {
  address: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M20 10c0 5-8 12-8 12s-8-7-8-12a8 8 0 1 1 16 0Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  ),
  order: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M4 7h16M4 7l1 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l1-12M9 11v4M15 11v4M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  language: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
      <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" stroke="currentColor" strokeWidth={1.5} />
    </svg>
  ),
  bell: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6 10a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 14 6 10Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
  phone: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 3h3l1.5 5-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 5 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 4.5 5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
  help: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth={1.5} />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.7v.3M12 17h.01" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  shield: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
  doc: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path d="M8 3h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
  pencil: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M4 20h4L20 8l-4-4L4 16v4Z" stroke="currentColor" strokeWidth={1.5} strokeLinejoin="round" />
    </svg>
  ),
  gear: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.5} />
      <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  ),
};

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/account/login?next=/account/profile");
        return;
      }
      setUser(data.user);
      const { data: profile } = await supabase
        .from("ariana_customer_profiles")
        .select("display_name, avatar_url")
        .eq("user_id", data.user.id)
        .maybeSingle();
      setDisplayName(profile?.display_name ?? data.user.email?.split("@")[0] ?? "");
      setAvatarUrl(profile?.avatar_url ?? null);
      setLoading(false);
    });
  }, [router]);

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    router.push("/catalog");
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <main className="px-5 py-6">
      <h1 className="font-display text-2xl mb-5">Profile</h1>

      <div className="flex items-center gap-3 bg-paper-raised rounded-2xl p-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-paper border border-ink/10 overflow-hidden flex items-center justify-center text-muted shrink-0">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            <ProfilePlaceholderIcon className="w-8 h-8" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{displayName || "Add your name"}</p>
          <p className="text-xs text-muted truncate">{user?.email}</p>
        </div>
        <a
          href="/account/profile/edit"
          aria-label="Edit profile"
          className="w-8 h-8 rounded-full bg-paper flex items-center justify-center text-ink shrink-0"
        >
          {icons.pencil}
        </a>
      </div>

      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5 mb-6">
        <Row href="/account/addresses" icon={icons.address} title="Address Book" subtitle="Manage your saved addresses" />
        <Row href="/account/orders" icon={icons.order} title="Order History" subtitle="View your past orders" />
        <Row href="/account/settings" icon={icons.gear} title="Settings" subtitle="Currency & appearance" />
        <Row href="/account/language" icon={icons.language} title="Language" subtitle="English" />
        <Row href="/account/notifications" icon={icons.bell} title="Notifications" />
      </div>

      <div className="bg-paper-raised rounded-2xl divide-y divide-ink/5 mb-8">
        <Row href="/account/contact" icon={icons.phone} title="Contact Us" />
        <Row href="/account/help" icon={icons.help} title="Get Help" />
        <Row href="/account/privacy" icon={icons.shield} title="Privacy Policy" />
        <Row href="/account/terms" icon={icons.doc} title="Terms & Conditions" />
      </div>

      <button
        onClick={handleSignOut}
        className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm hover:bg-ink/5 transition-colors"
      >
        Sign out
      </button>
    </main>
  );
}
