"use server";

import { createAdminClient } from "@/lib/supabase-admin";

type Slot = "left" | "middle" | "right";

export async function publishHeroLook(formData: FormData): Promise<{ error?: string }> {
  const label = String(formData.get("label") ?? "").trim();
  const bgColor = String(formData.get("bgColor") ?? "").trim();

  if (!label) return { error: "Give this look a label." };
  if (!bgColor) return { error: "Missing background color." };

  const middleFile = formData.get("middle") as File | null;
  if (!middleFile || middleFile.size === 0) {
    return { error: "The middle image is required — it's the only one that shows on mobile." };
  }

  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  try {
    // Inside the try block on purpose: if SUPABASE_SERVICE_ROLE_KEY is
    // missing/misconfigured on Vercel, this throws immediately, and we
    // want that surfaced as a real message instead of a generic
    // "error in Server Components render" digest.
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

    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Publish failed." };
  }
}
