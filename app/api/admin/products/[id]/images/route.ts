import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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
  const formData = await request.formData();
  const file = formData.get("image") as File | null;
  const alt = String(formData.get("alt") ?? "").trim();

  if (!file || file.size === 0) return NextResponse.json({ error: "An image is required." });

  try {
    const admin = createAdminClient();

    const { count } = await admin
      .from("ariana_product_images")
      .select("*", { count: "exact", head: true })
      .eq("product_id", productId);
    const position = count ?? 0;

    const ext = file.name.split(".").pop() || "jpg";
    const path = `${productId}/${Date.now()}.${ext}`;

    const { error: upErr } = await admin.storage.from("product-images").upload(path, file, {
      contentType: file.type || "image/jpeg",
    });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = admin.storage.from("product-images").getPublicUrl(path);

    const { error: insertErr } = await admin.from("ariana_product_images").insert({
      product_id: productId,
      url: pub.publicUrl,
      position,
      alt: alt || null,
    });
    if (insertErr) throw new Error(insertErr.message);

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed." });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const { id: productId } = await params;
  const imageId = request.nextUrl.searchParams.get("imageId");
  if (!imageId) return NextResponse.json({ error: "Missing imageId." }, { status: 400 });

  try {
    const admin = createAdminClient();

    const { data: row, error: fetchErr } = await admin
      .from("ariana_product_images")
      .select("url")
      .eq("id", imageId)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const path = row.url?.split("/product-images/").pop();
    if (path) await admin.storage.from("product-images").remove([path]);

    const { error: deleteErr } = await admin.from("ariana_product_images").delete().eq("id", imageId);
    if (deleteErr) throw new Error(deleteErr.message);

    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
