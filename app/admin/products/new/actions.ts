"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { redirect } from "next/navigation";

export async function createProduct(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";

  if (!name || !price) {
    throw new Error("Name and price are required.");
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const admin = createAdminClient();
  const { error } = await admin.from("ariana_products").insert({
    name,
    slug,
    price,
    description: description || null,
    category: category || null,
    is_published: isPublished,
  });

  if (error) throw new Error(error.message);

  redirect("/admin/products");
}
