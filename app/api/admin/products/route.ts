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
    const name = String(body.name ?? "").trim();
    const price = Number(body.price ?? 0);
    const category = String(body.category ?? "").trim();
    const description = String(body.description ?? "").trim();
    const isPublished = Boolean(body.isPublished);
    const imageUrls: string[] = Array.isArray(body.imageUrls) ? body.imageUrls : [];

    if (!name) return NextResponse.json({ error: "Name is required." });
    if (!price || price <= 0) return NextResponse.json({ error: "A valid price is required." });
    if (!category) return NextResponse.json({ error: "Category is required." });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const admin = createAdminClient();

    const { data: product, error: insertErr } = await admin
      .from("ariana_products")
      .insert({
        name,
        slug,
        price,
        category,
        description: description || null,
        is_published: isPublished,
      })
      .select("id")
      .single();
    if (insertErr) throw new Error(insertErr.message);

    if (imageUrls.length > 0) {
      const { error: imgErr } = await admin.from("ariana_product_images").insert(
        imageUrls.map((url, i) => ({ product_id: product.id, url, position: i }))
      );
      if (imgErr) throw new Error(imgErr.message);
    }

    revalidatePath("/");
    revalidatePath("/admin/products");

    return NextResponse.json({ id: product.id });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not create product." });
  }
}
