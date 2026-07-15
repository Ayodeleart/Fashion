"use server";

import { createAdminClient } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProduct(productId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price") ?? 0);
  const priceNgnRaw = formData.get("price_ngn");
  const priceNgn = priceNgnRaw && String(priceNgnRaw).trim() !== "" ? Number(priceNgnRaw) : null;
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
      price_ngn: priceNgn,
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
  redirect(`/admin/products/${productId}?saved=1`);
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
  redirect("/admin/products");
}

export async function addVariant(productId: string, formData: FormData) {
  const checkedSizes = formData.getAll("sizes").map((s) => String(s).trim()).filter(Boolean);
  const customSize = String(formData.get("customSize") ?? "").trim();
  const sizes = Array.from(new Set([...checkedSizes, ...(customSize ? [customSize] : [])]));

  const color = String(formData.get("color") ?? "").trim();
  const stock = Number(formData.get("stock") ?? 0);

  if (sizes.length === 0) return { error: "Pick at least one size, or type a custom one." };

  const admin = createAdminClient();
  const { error } = await admin.from("ariana_product_variants").insert(
    sizes.map((size) => ({
      product_id: productId,
      size,
      color: color || null,
      stock: Number.isFinite(stock) ? stock : 0,
    }))
  );
  if (error) return { error: error.message };

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/product/[slug]", "page");
  return { error: null };
}

export async function deleteVariant(variantId: string, productId: string) {
  const admin = createAdminClient();
  const { error } = await admin.from("ariana_product_variants").delete().eq("id", variantId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/product/[slug]", "page");
}
