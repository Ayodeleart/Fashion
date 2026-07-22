import TopBar from "@/components/TopBar";
import TryOnFlow from "@/components/TryOnFlow";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type TryOnTarget = {
  name: string;
  image: string;
  href: string;
} | null;

async function getProductTarget(slug: string): Promise<TryOnTarget> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_products")
    .select("name, slug, ariana_product_images(url, position)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();
  if (!data) return null;
  const images = [...(data.ariana_product_images ?? [])].sort((a, b) => a.position - b.position);
  if (!images[0]?.url) return null;
  return { name: data.name, image: images[0].url, href: `/product/${slug}` };
}

async function getLookTarget(lookId: string): Promise<TryOnTarget> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("label, image_url, href")
    .eq("id", lookId)
    .maybeSingle();
  if (!data || !data.image_url) return null;
  return { name: data.label, image: data.image_url, href: `/look/${lookId}` };
}

export default async function TryOnPage({
  searchParams,
}: {
  searchParams: Promise<{ product?: string; look?: string }>;
}) {
  const { product, look } = await searchParams;

  const target = product ? await getProductTarget(product) : look ? await getLookTarget(look) : null;

  return (
    <main>
      <TopBar hideAria />
      <div className="px-5 pb-10">
        <h1 className="text-lg font-semibold mb-1">Try On</h1>
        <p className="text-sm text-muted mb-5">
          AI-generated — a fit and style preview, not a guarantee of exact real-world appearance.
        </p>
        <TryOnFlow target={target} />
      </div>
    </main>
  );
}
