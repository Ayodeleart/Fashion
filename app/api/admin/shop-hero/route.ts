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
    if (!imageUrl) return NextResponse.json({ error: "Image is required." });

    const admin = createAdminClient();
    const { count } = await admin.from("ariana_shop_hero").select("id", { count: "exact", head: true });

    const { error } = await admin.from("ariana_shop_hero").insert({
      label: body.label || null,
      href: body.href || null,
      image_url: imageUrl,
      position: count ?? 0,
      status: "published",
    });
    if (error) throw new Error(error.message);

    revalidatePath("/catalog");
    revalidatePath("/admin/shop-hero");
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Publish failed." });
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
    const { data: row } = await admin.from("ariana_shop_hero").select("image_url").eq("id", id).single();
    const path = row?.image_url?.split("/shop-hero/").pop();
    if (path) await admin.storage.from("shop-hero").remove([path]);

    const { error } = await admin.from("ariana_shop_hero").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/catalog");
    revalidatePath("/admin/shop-hero");
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
