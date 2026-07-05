"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

type Address = {
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
};

const empty: Address = { fullName: "", phone: "", line1: "", line2: "", city: "", state: "" };

export default function AddressBookPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [address, setAddress] = useState<Address>(empty);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) {
        router.replace("/account/login?next=/account/addresses");
        return;
      }
      setUserId(data.user.id);
      const { data: profile } = await supabase
        .from("ariana_customer_profiles")
        .select("address")
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (profile?.address) setAddress({ ...empty, ...(profile.address as Partial<Address>) });
      setLoading(false);
    });
  }, [router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setPending(true);
    setSaved(false);
    await getSupabase().from("ariana_customer_profiles").upsert({
      user_id: userId,
      address,
      updated_at: new Date().toISOString(),
    });
    setPending(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  function field(key: keyof Address) {
    return {
      value: address[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress((a) => ({ ...a, [key]: e.target.value })),
    };
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
      <h1 className="font-display text-2xl mb-1">Address Book</h1>
      <p className="text-sm text-muted mb-6">Used to pre-fill your delivery details at checkout.</p>

      <form onSubmit={handleSave} className="space-y-3">
        <input {...field("fullName")} placeholder="Full name" className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
        <input {...field("phone")} placeholder="Phone number" className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
        <input {...field("line1")} placeholder="Address line 1" className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
        <input {...field("line2")} placeholder="Address line 2 (optional)" className="w-full border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
        <div className="flex gap-3">
          <input {...field("city")} placeholder="City" className="flex-1 border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
          <input {...field("state")} placeholder="State" className="flex-1 border border-ink/20 rounded-full px-4 py-3 text-sm bg-white" />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-ink text-paper rounded-full px-4 py-3 text-sm font-medium hover:bg-ink/90 transition-colors disabled:opacity-50"
        >
          {saved ? "Saved ✓" : pending ? "Saving…" : "Save address"}
        </button>
      </form>
    </main>
  );
}
