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
    const body = await request.json();
    const imageUrl = String(body.imageUrl ?? "").trim();
    if (!imageUrl) return NextResponse.json({ error: "An image is required." });

    const admin = createAdminClient();

    // Single-row setting: wipe any existing row(s), insert the new one.
    // Both login and signup pages read this same image, per the request
    // that desktop and mobile (and both auth pages) share one background.
    await admin.from("ariana_login_background").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { error } = await admin.from("ariana_login_background").insert({ image_url: imageUrl });
    if (error) throw new Error(error.message);

    revalidatePath("/account/login");
    revalidatePath("/account/signup");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." });
  }
}
