import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    const source = ["contact_page", "ai_complaint", "ai_handoff", "reel_send"].includes(body.source)
      ? body.source
      : "contact_page";
    const reelId = typeof body.reelId === "string" ? body.reelId : null;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are all required." });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_contact_messages").insert({ name, email, message, source, reel_id: reelId });
    if (error) throw new Error(error.message);

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed." });
  }
}
