import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

function requireAuth(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  return isValidSessionToken(session);
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: productId } = await params;

  try {
    const { ext } = await request.json();
    const safeExt = String(ext || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${safeExt}`;

    const admin = createAdminClient();
    const { data, error } = await admin.storage.from("product-images").createSignedUploadUrl(path);
    if (error) throw new Error(error.message);

    return NextResponse.json({ path: data.path, token: data.token });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create signed upload URL." },
      { status: 500 }
    );
  }
}
