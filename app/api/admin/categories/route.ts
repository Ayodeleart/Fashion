import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase-admin";
import { isValidSessionToken, ADMIN_COOKIE_NAME } from "@/lib/admin-auth";
import { slugify } from "@/lib/categories";

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
    const thumbnailUrl = String(body.thumbnailUrl ?? "").trim();

    if (!name) return NextResponse.json({ error: "Give this category a name." });

    const admin = createAdminClient();

    const { count } = await admin
      .from("ariana_categories")
      .select("id", { count: "exact", head: true });

    const { error: insertErr } = await admin.from("ariana_categories").insert({
      name,
      slug: slugify(name),
      thumbnail_url: thumbnailUrl || null,
      position: count ?? 0,
    });
    if (insertErr) throw new Error(insertErr.message);

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Create failed." });
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

    const updates: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim()) {
      updates.name = body.name.trim();
      updates.slug = slugify(body.name);
    }
    if (typeof body.thumbnailUrl === "string") {
      updates.thumbnail_url = body.thumbnailUrl || null;
    }
    if (typeof body.position === "number") {
      updates.position = body.position;
    }

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_categories").update(updates).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/categories");

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

    const { data: row } = await admin
      .from("ariana_categories")
      .select("thumbnail_url")
      .eq("id", id)
      .single();

    const path = row?.thumbnail_url?.split("/category-thumbnails/").pop();
    if (path) {
      await admin.storage.from("category-thumbnails").remove([path]);
    }

    const { error } = await admin.from("ariana_categories").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/categories");

    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
