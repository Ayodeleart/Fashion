import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export async function POST(request: NextRequest) {
  try {
    const { enabled, title, message, ctaText, ctaHref, imageUrl } = await request.json();
    const admin = createAdminClient();
    const { error } = await admin
      .from("ariana_promo_banner")
      .update({
        enabled: !!enabled,
        title: title ?? "",
        message: message ?? "",
        cta_text: ctaText || "Shop now",
        cta_href: ctaHref || "/catalog",
        image_url: imageUrl || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) return NextResponse.json({ error: error.message });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." });
  }
}
