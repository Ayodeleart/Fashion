import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys, userId } = body;
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription." });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_push_subscriptions").upsert(
      {
        endpoint,
        p256dh: keys.p256dh,
        auth_key: keys.auth,
        user_id: userId ?? null,
      },
      { onConflict: "endpoint" }
    );
    if (error) return NextResponse.json({ error: error.message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Subscribe failed." });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { endpoint } = await request.json();
    if (!endpoint) return NextResponse.json({ error: "Missing endpoint." });

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_push_subscriptions").delete().eq("endpoint", endpoint);
    if (error) return NextResponse.json({ error: error.message });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Unsubscribe failed." });
  }
}
