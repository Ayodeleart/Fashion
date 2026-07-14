import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 8;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const exclude = searchParams.get("exclude");
  const offset = Number(searchParams.get("offset") ?? "0");

  const supabase = getSupabase();
  let query = supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, price_ngn, category, ariana_product_images(url, position)")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (category) query = query.eq("category", category);
  if (exclude) query = query.neq("id", exclude);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ products: data ?? [], hasMore: (data?.length ?? 0) === PAGE_SIZE });
}
