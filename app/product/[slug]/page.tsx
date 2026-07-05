import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import AddToCartButton from "@/components/AddToCartButton";
import SaveButton from "@/components/SaveButton";
import TopBar from "@/components/TopBar";

export const dynamic = "force-dynamic";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  description: string | null;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, description, category, ariana_product_images(url, position)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return (data as unknown as ProductDetail) ?? null;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const images = [...(product.ariana_product_images ?? [])].sort((a, b) => a.position - b.position);
  const primaryImage = images[0]?.url ?? "";

  return (
    <main>
      <TopBar />

      <div className="px-5">
        {product.category && (
          <Link
            href={`/catalog?category=${encodeURIComponent(product.category)}`}
            className="text-xs text-muted hover:text-brass transition-colors"
          >
            ← {product.category}
          </Link>
        )}
      </div>

      <section className="px-5 pt-3 pb-4">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-paper-raised mb-3">
          {primaryImage ? (
            <Image src={primaryImage} alt={product.name} fill className="object-cover" sizes="100vw" priority />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
          )}
          <div className="absolute top-3 right-3">
            <SaveButton
              item={{
                productId: product.id,
                name: product.name,
                price: product.price,
                currency: product.currency,
                image: primaryImage,
                href: `/product/${product.slug}`,
              }}
              className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shrink-0"
            />
          </div>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
            {images.map((img) => (
              <div key={img.url} className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-paper-raised">
                <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
              </div>
            ))}
          </div>
        )}

        <h1 className="font-display text-2xl mb-1">{product.name}</h1>
        <p className="text-lg text-muted mb-5">{formatPrice(product.price, product.currency)}</p>

        {product.description && (
          <p className="text-sm text-ink/80 leading-relaxed mb-8 whitespace-pre-wrap">{product.description}</p>
        )}

        <AddToCartButton
          productId={product.id}
          name={product.name}
          price={product.price}
          currency={product.currency}
          image={primaryImage}
          className="w-full text-sm py-3.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors"
        />
      </section>
    </main>
  );
}
