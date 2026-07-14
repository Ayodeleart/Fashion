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
    // JSON body — the client already uploaded the image(s) directly to
    // Supabase Storage via a signed URL (see sign-upload/route.ts).
    const body = await request.json();
    const label = String(body.label ?? "").trim();
    const category = String(body.category ?? "seasonal").trim() || "seasonal";
    const story = String(body.story ?? "").trim() || null;
    const href = String(body.href ?? "").trim() || "#";
    const imageUrl = String(body.imageUrl ?? "").trim();

    if (!label) return NextResponse.json({ error: "Give this panel a label." });
    if (!imageUrl) return NextResponse.json({ error: "An image is required." });

    const admin = createAdminClient();

    // Only one look can be the Home hero at a time — unflag any current
    // one before inserting a new flagged row (the unique partial index
    // in the DB would reject the insert otherwise).
    if (body.isHero) {
      await admin.from("ariana_lookbook_panels").update({ is_hero: false }).eq("is_hero", true);
    }

    // Blank position = append at the end, same as before this field existed.
    let position: number | null = typeof body.position === "number" ? body.position : null;
    if (position === null) {
      const { data: maxRow } = await admin
        .from("ariana_lookbook_panels")
        .select("position")
        .order("position", { ascending: false })
        .limit(1)
        .maybeSingle();
      position = (maxRow?.position ?? 0) + 1;
    }

    const { error: insertErr } = await admin.from("ariana_lookbook_panels").insert({
      label,
      category,
      story,
      href,
      image_url: imageUrl,
      designer_name: body.designerName ?? null,
      location: body.location ?? null,
      badge: body.badge ?? null,
      fabric: body.fabric ?? null,
      occasion: body.occasion ?? null,
      description: body.description ?? null,
      style_tags: Array.isArray(body.styleTags) ? body.styleTags : [],
      feed_layout: body.feedLayout ?? null,
      is_editorial_break: Boolean(body.isEditorialBreak),
      editorial_label: body.editorialLabel ?? null,
      is_hero: Boolean(body.isHero),
      gallery_images: Array.isArray(body.galleryImages) ? body.galleryImages : [],
      media_type: body.mediaType === "video" ? "video" : "image",
      video_url: body.videoUrl ?? null,
      promo_text: body.promoText ?? null,
      position,
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
      .select("image_url, gallery_images")
      .eq("id", id)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const paths = [row.image_url, ...((row.gallery_images as string[]) ?? [])]
      .map((url) => url?.split("/lookbook/").pop())
      .filter((p): p is string => Boolean(p));
    if (paths.length > 0) await admin.storage.from("lookbook").remove(paths);

    const { error: deleteErr } = await admin.from("ariana_lookbook_panels").delete().eq("id", id);
    if (deleteErr) throw new Error(deleteErr.message);

    revalidatePath("/");
    revalidatePath("/admin/lookbook");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
