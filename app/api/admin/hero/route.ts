import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";

type Slot = "left" | "middle" | "right";

export async function POST(request: NextRequest) {
  // Route handlers aren't behind the admin middleware the way pages are,
  // so check the session cookie explicitly here.
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (!isValidSessionToken(session)) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 });
  }

  const formData = await request.formData();
  const label = String(formData.get("label") ?? "").trim();
  const bgColor = String(formData.get("bgColor") ?? "").trim();

  if (!label) return NextResponse.json({ error: "Give this look a label." });
  if (!bgColor) return NextResponse.json({ error: "Missing background color." });

  const middleFile = formData.get("middle") as File | null;
  if (!middleFile || middleFile.size === 0) {
    return NextResponse.json({
      error: "The middle image is required — it's the only one that shows on mobile.",
    });
  }

  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    const admin = createAdminClient();

    async function uploadSlot(slot: Slot): Promise<string | null> {
      const file = formData.get(slot) as File | null;
      if (!file || file.size === 0) return null;

      const ext = file.type === "image/png" ? "png" : file.name.split(".").pop() || "png";
      const path = `${slug}-${slot}.${ext}`;
      const { error } = await admin.storage.from("hero-looks").upload(path, file, {
        upsert: true,
        contentType: file.type || "image/png",
      });
      if (error) throw new Error(`Upload (${slot}): ${error.message}`);

      const { data } = admin.storage.from("hero-looks").getPublicUrl(path);
      return data.publicUrl;
    }

    const [leftUrl, middleUrl, rightUrl] = await Promise.all([
      uploadSlot("left"),
      uploadSlot("middle"),
      uploadSlot("right"),
    ]);

    const { error: insertErr } = await admin.from("ariana_hero_looks").insert({
      label,
      image_left_url: leftUrl,
      image_middle_url: middleUrl,
      image_right_url: rightUrl,
      bg_color: bgColor,
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
