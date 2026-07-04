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
    // JSON body now — the client already uploaded both images directly
    // to Supabase Storage via a signed URL (see sign-upload/route.ts)
    // before calling this. This endpoint only ever handles small JSON,
    // so it can never hit Vercel's function body-size limit.
    const body = await request.json();
    const label = String(body.label ?? "").trim();
    const href = String(body.href ?? "").trim();
    const desktopUrl = String(body.desktopUrl ?? "").trim();
    const mobileUrl = String(body.mobileUrl ?? "").trim();

    if (!label) return NextResponse.json({ error: "Give this banner a label." });
    if (!desktopUrl && !mobileUrl) {
      return NextResponse.json({ error: "Upload at least one image (desktop or mobile)." });
    }

    const admin = createAdminClient();

    const { error: insertErr } = await admin.from("ariana_hero_banners").insert({
      label,
      image_desktop_url: desktopUrl || null,
      image_mobile_url: mobileUrl || null,
      href: href || null,
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
      .select("image_desktop_url, image_mobile_url")
      .eq("id", id)
      .single();
    if (fetchErr) throw new Error(fetchErr.message);

    const paths = [row.image_desktop_url, row.image_mobile_url]
      .filter((url): url is string => Boolean(url))
      .map((url) => url.split("/hero-banners/").pop())
      .filter((p): p is string => Boolean(p));

    if (paths.length > 0) {
      await admin.storage.from("hero-banners").remove(paths);
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
