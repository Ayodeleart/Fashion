import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { StyleCard } from "@/components/home/StyleCard";
import LookGallery from "@/components/home/LookGallery";
import { ShareButton } from "@/components/home/LookActions";
import RevealContainer from "@/components/RevealContainer";

export const dynamic = "force-dynamic";

type LookDetail = {
  id: string;
  label: string;
  image_url: string;
  href: string | null;
  category: string | null;
  story: string | null;
  designer_name: string | null;
  location: string | null;
  badge: "ready-made" | "bespoke" | "ready+bespoke" | null;
  fabric: string | null;
  occasion: string | null;
  description: string | null;
  gallery_images: string[] | null;
};

type SimilarProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  ariana_product_images: { url: string; position: number }[];
};

const DETAIL_COLUMNS =
  "id, label, image_url, href, category, story, designer_name, location, badge, fabric, occasion, description, gallery_images";

async function getLook(id: string): Promise<LookDetail | null> {
  const supabase = getSupabase();
  const { data } = await supabase.from("ariana_lookbook_panels").select(DETAIL_COLUMNS).eq("id", id).maybeSingle();
  return (data as LookDetail) ?? null;
}

async function getSimilarProducts(category: string | null): Promise<SimilarProduct[]> {
  if (!category) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_products")
    .select("id, name, slug, price, currency, ariana_product_images(url, position)")
    .eq("category", category)
    .limit(10);
  return (data as SimilarProduct[]) ?? [];
}

async function getCategoryLooks(category: string | null, excludeId: string) {
  if (!category) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, designer_name, location, badge")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(12);
  return data ?? [];
}

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: currency || "NGN", maximumFractionDigits: 0 }).format(
    price
  );
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await getLook(id);
  if (!look) notFound();

  const [similarProducts, categoryLooks] = await Promise.all([
    getSimilarProducts(look.category),
    getCategoryLooks(look.category, look.id),
  ]);

  const galleryImages = [look.image_url, ...(Array.isArray(look.gallery_images) ? look.gallery_images : [])];
  const hasShopLink = look.href && look.href !== "#";
  const isBespoke = look.badge === "bespoke" || look.badge === "ready+bespoke";
  const enquiryQuery = new URLSearchParams({ look: look.id, subject: look.label }).toString();

  return (
    <main>
      <div className="px-4 pt-4 flex items-center">
        <Link
          href="/"
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-paper-raised border border-ink/10 flex items-center justify-center"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
      </div>

      <RevealContainer>
        {/* Swipeable, Pinterest-style — swipe through every uploaded photo.
            Love icon in the corner saves it to favorites. */}
        <div data-reveal="image" className="mt-3">
          <LookGallery id={look.id} label={look.label} images={galleryImages} />
        </div>

        {/* Caption sits right below the gallery, same spot a caption goes
            when you write one in the upload form. */}
        <section className="px-4 md:px-8 pt-5 pb-3">
          <h1 data-reveal="heading" className="font-display text-3xl md:text-4xl text-ink mb-2">
            {look.label}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-sm text-muted mb-4">
            {look.designer_name && <span>{look.designer_name}</span>}
            {look.designer_name && look.location && <span aria-hidden>·</span>}
            {look.location && <span>{look.location}</span>}
            {look.badge && (
              <span className="ml-1 px-2.5 py-0.5 rounded-full bg-paper-raised text-ink text-[10px] tracking-wide uppercase">
                {look.badge}
              </span>
            )}
          </div>

          {(look.description || look.story) && (
            <p data-reveal="paragraph" className="text-ink/80 leading-relaxed mb-4 max-w-2xl">
              {look.description ?? look.story}
            </p>
          )}

          <div className="flex gap-8 text-sm">
            {look.fabric && (
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wide mb-1">Fabric</p>
                <p className="text-ink">{look.fabric}</p>
              </div>
            )}
            {look.occasion && (
              <div>
                <p className="text-[11px] text-muted uppercase tracking-wide mb-1">Occasion</p>
                <p className="text-ink">{look.occasion}</p>
              </div>
            )}
          </div>
        </section>

        {/* Similar products, with price, straight through to Shop. */}
        {similarProducts.length > 0 && (
          <section className="py-6 border-t border-ink/10">
            <h2 data-reveal="heading" className="font-display text-xl md:text-2xl text-ink px-4 md:px-8 mb-4">
              Similar Products
            </h2>
            <div className="flex gap-2 md:gap-3 overflow-x-auto px-4 md:px-8 no-scrollbar">
              {similarProducts.map((product) => {
                const image = [...(product.ariana_product_images ?? [])].sort((a, b) => a.position - b.position)[0]?.url;
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    data-reveal="card"
                    className="w-36 md:w-44 shrink-0"
                  >
                    <div className="relative w-full aspect-[3/4] bg-paper-raised overflow-hidden mb-2">
                      {image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={product.name} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <p className="text-sm text-ink truncate">{product.name}</p>
                    <p className="text-sm text-ink font-medium">{formatPrice(product.price, product.currency)}</p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* More pictures from the same category. */}
        {categoryLooks.length > 0 && (
          <section className="py-6 border-t border-ink/10">
            <h2 data-reveal="heading" className="font-display text-xl md:text-2xl text-ink px-4 md:px-8 mb-4">
              More Looks
            </h2>
            <div className="flex gap-1.5 overflow-x-auto px-4 md:px-8 no-scrollbar">
              {categoryLooks.map((l) => (
                <div key={l.id} className="w-36 md:w-44 shrink-0">
                  <StyleCard
                    look={{
                      id: l.id,
                      label: l.label,
                      image: l.image_url,
                      href: `/look/${l.id}`,
                      designerName: l.designer_name,
                      location: l.location,
                      badge: l.badge,
                    }}
                    aspectClassName="aspect-[3/4]"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Actions — View In Shop is always the top, standout action. */}
        <section className="px-4 md:px-8 py-8 border-t border-ink/10">
          <div className="grid grid-cols-2 gap-2 max-w-md mx-auto md:mx-0">
            {hasShopLink && (
              <Link
                href={look.href as string}
                className="col-span-2 flex items-center justify-center h-12 rounded-full bg-brass text-ink text-sm font-medium"
              >
                View In Shop
              </Link>
            )}

            {isBespoke && (
              <Link
                href={`/contact?reason=bespoke&${enquiryQuery}`}
                className={`flex items-center justify-center h-12 rounded-full border border-ink/10 text-ink text-sm text-center px-3 ${
                  !hasShopLink ? "col-span-2" : ""
                }`}
              >
                Discuss With Tailor
              </Link>
            )}
            <Link
              href={`/contact?reason=appointment&${enquiryQuery}`}
              className="flex items-center justify-center h-12 rounded-full border border-ink/10 text-ink text-sm text-center px-3"
            >
              Book Appointment
            </Link>
            <Link
              href={`/contact?reason=enquiry&${enquiryQuery}`}
              className="flex items-center justify-center h-12 rounded-full border border-ink/10 text-ink text-sm text-center px-3"
            >
              Make Enquiry
            </Link>
            <ShareButton label={look.label} />
          </div>
        </section>
      </RevealContainer>
    </main>
  );
}
