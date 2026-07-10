import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { sendPush } from "@/lib/webpush";

export async function POST(request: NextRequest) {
  try {
    const { title, body, url } = await request.json();
    if (!title?.trim() || !body?.trim()) {
      return NextResponse.json({ error: "Title and message are both required." });
    }

    const admin = createAdminClient();
    const { data: subs, error } = await admin
      .from("ariana_push_subscriptions")
      .select("id, endpoint, p256dh, auth_key");
    if (error) return NextResponse.json({ error: error.message });
    if (!subs || subs.length === 0) {
      return NextResponse.json({ error: "No subscribers yet." });
    }

    let sent = 0;
    const deadIds: string[] = [];

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await sendPush(sub, { title, body, url: url || "/" });
          sent++;
        } catch (err) {
          // 404/410 = the browser subscription expired or was revoked —
          // clean it up so future sends don't keep retrying a dead endpoint.
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) deadIds.push(sub.id);
        }
      })
    );

    if (deadIds.length > 0) {
      await admin.from("ariana_push_subscriptions").delete().in("id", deadIds);
    }

    return NextResponse.json({ ok: true, sent, total: subs.length, removed: deadIds.length });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed." });
  }
}
