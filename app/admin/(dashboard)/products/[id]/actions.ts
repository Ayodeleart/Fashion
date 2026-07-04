"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function updateProduct(productId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const isPublished = formData.get("is_published") === "on";

  if (!name || !price) {
    throw new Error("Name and price are required.");
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("ariana_products")
    .update({
      name,
      price,
      description: description || null,
      category: category || null,
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function deleteProduct(productId: string) {
  const admin = createAdminClient();

  // Clean up storage objects for this product's images first.
  const { data: images } = await admin
    .from("ariana_product_images")
    .select("url")
    .eq("product_id", productId);

  const paths = (images ?? [])
    .map((img) => img.url?.split("/product-images/").pop())
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await admin.storage.from("product-images").remove(paths);
  }

  const { error } = await admin.from("ariana_products").delete().eq("id", productId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/products");
  revalidatePath("/");
}
