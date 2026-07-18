import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

const ALLOWED_SOURCES = ["contact_page", "ai_complaint", "ai_handoff", "reel_send", "appointment", "enquiry"];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim();
    const message = String(body.message ?? "").trim();
    const source = ALLOWED_SOURCES.includes(body.source) ? body.source : "contact_page";
    const reelId = typeof body.reelId === "string" ? body.reelId : null;
    const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;
    const serviceType = typeof body.serviceType === "string" && body.serviceType.trim() ? body.serviceType.trim() : null;
    const preferredDate = typeof body.preferredDate === "string" && body.preferredDate.trim() ? body.preferredDate.trim() : null;
    const preferredTime = typeof body.preferredTime === "string" && body.preferredTime.trim() ? body.preferredTime.trim() : null;
    const lookId = typeof body.lookId === "string" && body.lookId.trim() ? body.lookId.trim() : null;
    const productId = typeof body.productId === "string" && body.productId.trim() ? body.productId.trim() : null;

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Name, email, and message are all required." });
    }

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_contact_messages").insert({
      name,
      email,
      message,
      source,
      reel_id: reelId,
      phone,
      service_type: serviceType,
      preferred_date: preferredDate,
      preferred_time: preferredTime,
      look_id: lookId,
      product_id: productId,
    });
    if (error) throw new Error(error.message);

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Send failed." });
  }
}
