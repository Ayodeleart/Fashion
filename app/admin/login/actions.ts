"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyCredentials, createSessionToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = String(formData.get("from") ?? "/admin");

  let valid: boolean;
  try {
    valid = verifyCredentials(username, password);
  } catch {
    // ADMIN_USERNAME/ADMIN_PASSWORD not set in this environment yet.
    redirect(`/admin/login?error=config&from=${encodeURIComponent(from)}`);
  }

  if (!valid) {
    redirect(`/admin/login?error=invalid&from=${encodeURIComponent(from)}`);
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });

  redirect(from && from.startsWith("/admin") ? from : "/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE_NAME);
  redirect("/admin/login");
}
