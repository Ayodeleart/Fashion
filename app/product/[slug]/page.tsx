import { notFound } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { resolveCurrency, resolvePrice } from "@/lib/currency";
import ProductGallery from "@/components/ProductGallery";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";
import RevealContainer from "@/components/RevealContainer";
import ReviewsSection, { type Review } from "@/components/ReviewsSection";
import RelatedProducts from "@/components/RelatedProducts";
import TrackRecentlyViewed from "@/components/TrackRecentlyViewed";

export const dynamic = "force-dynamic";

type ProductDetail = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  price_ngn: number | null;
  description: string | null;
  category: string | null;
  ariana_product_images: { url: string; position: number }[];
};

type Variant = { id: string; size: string; color: string | null; stock: number };

async function getProduct(slug: string): Promise<ProductDetail | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, price_ngn, description, category, ariana_product_images(url, position)")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  return (data as unknown as ProductDetail) ?? null;
}

async function getVariants(productId: string): Promise<Variant[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_product_variants")
    .select("id, size, color, stock")
    .eq("product_id", productId)
    .order("size", { ascending: true });
  return data ?? [];
}

async function getReviews(productId: string): Promise<Review[]> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_product_reviews")
    .select("id, rating, fit_feedback, title, body, author_name, helpful_count, created_at")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

async function getSimilarCount(category: string | null, excludeId: string): Promise<number> {
  if (!category) return 0;
  const supabase = getSupabase();
  const { count } = await supabase
    .from("ariana_products")
    .select("id", { count: "exact", head: true })
    .eq("is_published", true)
    .eq("category", category)
    .neq("id", excludeId);
  return count ?? 0;
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, currency] = await Promise.all([getProduct(slug), resolveCurrency()]);
  if (!product) notFound();

  const [images, variants, reviews, similarCount] = await Promise.all([
    Promise.resolve([...(product.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)),
    getVariants(product.id),
    getReviews(product.id),
    getSimilarCount(product.category, product.id),
  ]);
  const primaryImage = images[0]?.url ?? "";
  const displayPrice = resolvePrice(product, currency);

  // No TopBar here by design — the product page is meant to be an
  // immersive, uninterrupted view of the piece. A real back button
  // replaces it below (bottom nav is hidden on this route entirely —
  // see StorefrontChrome — so the floating add-to-cart bar has the
  // space to itself).
  return (
    <RevealContainer className="md:max-w-5xl md:mx-auto md:pt-8 md:grid md:grid-cols-2 md:gap-10">
      <TrackRecentlyViewed
        id={product.id}
        name={product.name}
        slug={product.slug}
        price={displayPrice.amount}
        currency={displayPrice.currency}
        category={product.category}
        image={primaryImage}
      />

      <div className="px-5 pt-5 md:px-0 md:pt-0 flex items-center justify-between">
        <Link
          href={product.category ? `/catalog?category=${encodeURIComponent(product.category)}` : "/catalog"}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-paper-raised border border-ink/10 flex items-center justify-center shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        {product.category && (
          <Link
            href={`/catalog?category=${encodeURIComponent(product.category)}`}
            className="text-xs text-muted hover:text-brass transition-colors md:hidden"
          >
            {product.category}
          </Link>
        )}
      </div>

      <section className="px-5 md:px-0 pt-3 md:pt-3 pb-4 md:col-start-1 md:row-start-2">
        <ProductGallery
          images={images}
          productName={product.name}
          saveItem={{
            productId: product.id,
            name: product.name,
            price: displayPrice.amount,
            currency: displayPrice.currency,
            image: primaryImage,
            href: `/product/${product.slug}`,
          }}
        />
      </section>

      <section className="px-5 md:px-0 pb-4 md:col-start-2 md:row-start-2 md:pt-3">
        <h1 className="font-display text-2xl md:text-3xl mb-1" data-reveal="heading">
          {product.name}
        </h1>
        <p className="text-lg text-muted mb-5" data-reveal="paragraph">
          {formatPrice(displayPrice.amount, displayPrice.currency)}
        </p>

        {product.description && (
          <p className="text-sm text-ink/80 leading-relaxed mb-8 whitespace-pre-wrap" data-reveal="paragraph">
            {product.description}
          </p>
        )}

        <ProductPurchasePanel
          productId={product.id}
          name={product.name}
          price={displayPrice.amount}
          currency={displayPrice.currency}
          image={primaryImage}
          variants={variants}
          slug={product.slug}
        />

        <ReviewsSection productId={product.id} reviews={reviews} />

        {similarCount > 0 && (
          <div className="flex items-center justify-between mt-10 pt-8 border-t border-ink/10">
            <p className="text-xs tracking-[0.1em] font-medium text-ink/60">
              SEE {similarCount}+ SIMILAR STYLES
            </p>
            <Link
              href={`/catalog?category=${encodeURIComponent(product.category ?? "")}`}
              className="text-sm font-medium bg-ink text-paper rounded-full px-5 py-2.5 hover:bg-ink/90 transition-colors shrink-0"
            >
              Shop Similar
            </Link>
          </div>
        )}

        <RelatedProducts
          title="YOU MIGHT ALSO LIKE"
          category={product.category}
          excludeId={product.id}
          infinite
        />
      </section>
    </RevealContainer>
  );
}
