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

  const formData = await request.formData();
  const label = String(formData.get("label") ?? "").trim();
  const href = String(formData.get("href") ?? "").trim() || "#";
  const file = formData.get("image") as File | null;

  if (!label) return NextResponse.json({ error: "Give this panel a label." });
  if (!file || file.size === 0) return NextResponse.json({ error: "An image is required." });

  try {
    const admin = createAdminClient();
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${slug}-${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage.from("lookbook").upload(path, file, {
      contentType: file.type || "image/jpeg",
    });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = admin.storage.from("lookbook").getPublicUrl(path);

    const { error: insertErr } = await admin.from("ariana_lookbook_panels").insert({
      label,
      href,
      image_url: pub.publicUrl,
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
