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
    const { message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: "Message can't be empty." });

    const admin = createAdminClient();
    const { count } = await admin.from("ariana_announcements").select("id", { count: "exact", head: true });
    const { error } = await admin.from("ariana_announcements").insert({ message: message.trim(), position: count ?? 0 });
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/announcements");
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
    const { id, message, enabled } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing id." }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (typeof message === "string") updates.message = message;
    if (typeof enabled === "boolean") updates.enabled = enabled;

    const admin = createAdminClient();
    const { error } = await admin.from("ariana_announcements").update(updates).eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/announcements");
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
    const { error } = await admin.from("ariana_announcements").delete().eq("id", id);
    if (error) throw new Error(error.message);

    revalidatePath("/");
    revalidatePath("/admin/announcements");
    return NextResponse.json({});
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Delete failed." });
  }
}
