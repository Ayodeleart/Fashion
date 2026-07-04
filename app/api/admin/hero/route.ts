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
  const href = String(formData.get("href") ?? "").trim();
  const desktopFile = formData.get("desktop") as File | null;
  const mobileFile = formData.get("mobile") as File | null;

  if (!label) return NextResponse.json({ error: "Give this banner a label." });
  if (!desktopFile || desktopFile.size === 0) {
    return NextResponse.json({ error: "The desktop image is required." });
  }
  if (!mobileFile || mobileFile.size === 0) {
    return NextResponse.json({ error: "The mobile image is required." });
  }

  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    const admin = createAdminClient();

    async function uploadImage(file: File, variant: "desktop" | "mobile"): Promise<string> {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${slug}-${variant}-${Date.now()}.${ext}`;
      const { error } = await admin.storage.from("hero-banners").upload(path, file, {
        contentType: file.type || "image/jpeg",
      });
      if (error) throw new Error(`Upload (${variant}): ${error.message}`);
      const { data } = admin.storage.from("hero-banners").getPublicUrl(path);
      return data.publicUrl;
    }

    const [desktopUrl, mobileUrl] = await Promise.all([
      uploadImage(desktopFile, "desktop"),
      uploadImage(mobileFile, "mobile"),
    ]);

    const { error: insertErr } = await admin.from("ariana_hero_banners").insert({
      label,
      image_desktop_url: desktopUrl,
      image_mobile_url: mobileUrl,
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
