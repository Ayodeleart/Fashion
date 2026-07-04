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
    // JSON body — the client already uploaded the image directly to
    // Supabase Storage via a signed URL (see sign-upload/route.ts).
    const body = await request.json();
    const label = String(body.label ?? "").trim();
    const href = String(body.href ?? "").trim() || "#";
    const imageUrl = String(body.imageUrl ?? "").trim();

    if (!label) return NextResponse.json({ error: "Give this panel a label." });
    if (!imageUrl) return NextResponse.json({ error: "An image is required." });

    const admin = createAdminClient();

    const { error: insertErr } = await admin.from("ariana_lookbook_panels").insert({
      label,
      href,
      image_url: imageUrl,
    });
    if (insertErr) throw new Error(insertErr.message);

    revalidatePath("/");
    revalidatePath("/admin/lookbook");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Save failed." });
  }
}

export async function DELETE(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

  try {
    const admin = createAdminClient();

    const { data: row, error: fetchErr } = await admin
      .from("ariana_lookbook_panels")
      .select("image_url")
      .eq("id", id)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const path = row.image_url?.split("/lookbook/").pop();
    if (path) await admin.storage.from("lookbook").remove([path]);

    const { error: deleteErr } = await admin.from("ariana_lookbook_panels").delete().eq("id", id);
    if (deleteErr) throw new Error(deleteErr.message);

    revalidatePath("/");
    revalidatePath("/admin/lookbook");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
