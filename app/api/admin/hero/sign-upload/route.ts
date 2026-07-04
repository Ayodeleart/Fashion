import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function requireAuth(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionToken(session);
}

/**
 * Returns a signed upload URL for hero-banners storage. The actual file
 * bytes never pass through this (or any) Vercel function — the browser
 * uploads directly to Supabase using the returned token. This is what
 * lets full-resolution images through: Vercel's serverless functions cap
 * request bodies at a few MB regardless of plan, but a signed-upload
 * request here only carries a filename, so it's a few bytes either way.
 */
export async function POST(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const { variant, ext } = await request.json();
    const safeExt = String(ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const safeVariant = variant === "mobile" ? "mobile" : "desktop";
    const path = `${crypto.randomUUID()}-${safeVariant}.${safeExt}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("hero-banners").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create signed upload URL." },
      { status: 500 }
    );
  }
}
