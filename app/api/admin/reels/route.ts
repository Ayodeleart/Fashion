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
    const videoUrl = String(body.videoUrl ?? "").trim();
    if (!videoUrl) return NextResponse.json({ error: "A video is required." });

    const admin = createAdminClient();
    const { count } = await admin.from("ariana_reels").select("id", { count: "exact", head: true });

    const { error } = await admin.from("ariana_reels").insert({
      video_url: videoUrl,
      thumbnail_url: body.thumbnailUrl || null,
      caption: body.caption || null,
      product_id: body.productId || null,
      category_id: body.categoryId || null,
      position: count ?? 0,
      status: "published",
    });
    if (error) throw new Error(error.message);

    revalidatePath("/reels");
    revalidatePath("/admin/reels");
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
    const { data: row } = await admin.from("ariana_reels").select("video_url").eq("id", id).single();
    const path = row?.video_url?.split("/reels/").pop();
    if (path) await admin.storage.from("reels").remove([path]);

    const { error } = await admin.from("ariana_reels").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/reels");
    revalidatePath("/admin/reels");
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
