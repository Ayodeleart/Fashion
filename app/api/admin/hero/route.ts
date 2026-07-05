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
    // Desktop and mobile are now separate rows entirely (device column)
    // — no shared banner object, no fallback substitution between them.
    const body = await request.json();
    const label = String(body.label ?? "").trim();
    const href = String(body.href ?? "").trim();
    const imageUrl = String(body.imageUrl ?? "").trim();
    const device = body.device === "mobile" ? "mobile" : "desktop";
    const subtitle = String(body.subtitle ?? "").trim();
    const ctaText = String(body.ctaText ?? "").trim();
    const ctaHref = String(body.ctaHref ?? "").trim();

    if (!label) return NextResponse.json({ error: "Give this banner a label." });
    if (!imageUrl) return NextResponse.json({ error: "An image is required." });

    const admin = createAdminClient();

    const { error: insertErr } = await admin.from("ariana_hero_banners").insert({
      label,
      device,
      image_url: imageUrl,
      href: href || null,
      subtitle: subtitle || null,
      cta_text: ctaText || null,
      cta_href: ctaHref || null,
      status: "published",
    });
    if (insertErr) throw new Error(`Insert: ${insertErr.message}`);

    revalidatePath("/");
    revalidatePath("/admin/hero");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Publish failed." });
  }
}

export async function PATCH(request: NextRequest) {
  if (!requireAuth(request)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const id = String(body.id ?? "");
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const admin = createAdminClient();

    if (body.setDefault) {
      const { data: row } = await admin.from("ariana_hero_banners").select("device").eq("id", id).single();
      if (!row) return NextResponse.json({ error: "Banner not found." });

      const { data: minRow } = await admin
        .from("ariana_hero_banners")
        .select("position")
        .eq("device", row.device)
        .order("position", { ascending: true })
        .limit(1)
        .single();

      const newPosition = (minRow?.position ?? 0) - 1;
      const { error } = await admin.from("ariana_hero_banners").update({ position: newPosition }).eq("id", id);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/");
    revalidatePath("/admin/hero");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Update failed." });
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
      .from("ariana_hero_banners")
      .select("image_url")
      .eq("id", id)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const path = row.image_url?.split("/hero-banners/").pop();
    if (path) {
      await admin.storage.from("hero-banners").remove([path]);
    }

    const { error: deleteErr } = await admin.from("ariana_hero_banners").delete().eq("id", id);
    if (deleteErr) throw new Error(deleteErr.message);

    revalidatePath("/");
    revalidatePath("/admin/hero");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
