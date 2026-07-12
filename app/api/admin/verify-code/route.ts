import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase-admin";
import { isAllowedAdminEmail, verifyAccessCode, createSessionToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  try {
    const { code, accessToken } = await request.json();
    if (!code || !accessToken) {
      return NextResponse.json({ error: "Missing code or session." });
    }

    // Verify the Supabase access token server-side rather than trusting
    // any client-supplied email — this is what actually confirms "this
    // really is a session Supabase/Google issued," not just a string
    // the browser happened to send.
    const admin = createAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
    if (userError || !userData.user) {
      return NextResponse.json({ error: "Your sign-in session expired — try again." });
    }

    if (!isAllowedAdminEmail(userData.user.email)) {
      return NextResponse.json({ error: "That Google account isn't authorized for admin access." });
    }

    if (!verifyAccessCode(code)) {
      return NextResponse.json({ error: "Incorrect code." });
    }

    const store = await cookies();
    store.set(ADMIN_COOKIE_NAME, createSessionToken(), {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Verification failed." });
  }
}
