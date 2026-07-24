"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";
import ProfilePlaceholderIcon from "@/components/ProfilePlaceholderIcon";
import AccountShell from "@/components/AccountShell";

export default function EditProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = getSupabase();

    async function load() {
      try {
        const { data, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!data.user) {
          router.replace("/account/login?next=/account/profile/edit");
          return;
        }
        if (cancelled) return;
        setUser(data.user);

        const { data: profile, error: profileErr } = await supabase
          .from("ariana_customer_profiles")
          .select("display_name, avatar_url, phone")
          .eq("user_id", data.user.id)
          .maybeSingle();
        if (profileErr) throw profileErr;

        if (cancelled) return;
        setDisplayName(profile?.display_name ?? data.user.email?.split("@")[0] ?? "");
        setPhone(profile?.phone ?? "");
        setAvatarUrl(profile?.avatar_url ?? null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setPending(true);
    setError(null);
    try {
      const supabase = getSupabase();
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
      if (uploadErr) throw new Error(uploadErr.message);

      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);

      const { error: upsertErr } = await supabase.from("ariana_customer_profiles").upsert({
        user_id: user.id,
        avatar_url: pub.publicUrl,
        display_name: displayName || null,
        phone: phone || null,
        updated_at: new Date().toISOString(),
      });
      if (upsertErr) throw new Error(upsertErr.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload photo.");
    } finally {
      setPending(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setPending(true);
    setError(null);
    setSaved(false);
    const supabase = getSupabase();
    const { error: upsertErr } = await supabase.from("ariana_customer_profiles").upsert({
      user_id: user.id,
      display_name: displayName || null,
      phone: phone || null,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });
    setPending(false);
    if (upsertErr) {
      setError(upsertErr.message);
      return;
    }
    setSaved(true);
    setTimeout(() => router.push("/account/profile"), 700);
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted">Loading…</p>
      </main>
    );
  }

  return (
    <AccountShell>
    <main className="px-5 py-6 max-w-sm mx-auto">
      <h1 className="font-display text-2xl mb-6">Edit profile</h1>

      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3 mb-4">{error}</p>
      )}

      <div className="flex flex-col items-center mb-8">
        <div className="relative w-24 h-24">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt="" className="w-24 h-24 rounded-full object-cover border border-ink/10" />
          ) : (
            <div className="w-24 h-24 rounded-full liquid-glass-light flex items-center justify-center text-muted">
              <ProfilePlaceholderIcon className="w-10 h-10" />
            </div>
          )}
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-xs cursor-pointer">
            ✎
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={pending} />
          </label>
        </div>
        <p className="text-xs text-muted mt-2">{user?.email}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full liquid-glass-light rounded-full px-4 py-3 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Phone number</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Used for delivery updates"
            className="w-full liquid-glass-light rounded-full px-4 py-3 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-paper rounded-full px-4 py-3 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save changes"}
        </button>
      </form>
    </main>
    </AccountShell>
  );
}
