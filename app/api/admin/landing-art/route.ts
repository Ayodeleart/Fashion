import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function requireAuth(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionToken(session);
}

export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }
  try {
    const { imageUrl, quoteTop, quoteBottom } = await request.json();
    const admin = createAdminClient();
    const { error } = await admin
      .from("ariana_landing_art_section")
      .update({
        image_url: imageUrl || null,
        quote_top: quoteTop || "WHERE ELEGANCE AND FASHION BECOMES ART",
        quote_bottom: quoteBottom || "MEETS ELEGANCE AND FASHION BECOMES ART",
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1);
    if (error) throw new Error(error.message);

    revalidatePath("/landing");
    revalidatePath("/");
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." });
  }
}
