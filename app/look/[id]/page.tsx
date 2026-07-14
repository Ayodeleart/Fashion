import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { StyleCard } from "@/components/home/StyleCard";
import { LookSaveButton, ShareButton } from "@/components/home/LookActions";

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

const DETAIL_COLUMNS =
  "id, label, image_url, href, category, story, designer_name, location, badge, fabric, occasion, description, gallery_images";

async function getLook(id: string): Promise<LookDetail | null> {
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select(DETAIL_COLUMNS)
    .eq("id", id)
    .maybeSingle();
  return (data as LookDetail) ?? null;
}

async function getSimilar(category: string | null, excludeId: string) {
  if (!category) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, designer_name, location, badge")
    .eq("category", category)
    .neq("id", excludeId)
    .limit(8);
  return data ?? [];
}

async function getMoreFromDesigner(designerName: string | null, excludeId: string) {
  if (!designerName) return [];
  const supabase = getSupabase();
  const { data } = await supabase
    .from("ariana_lookbook_panels")
    .select("id, label, image_url, designer_name, location, badge")
    .eq("designer_name", designerName)
    .neq("id", excludeId)
    .limit(8);
  return data ?? [];
}

function ScrollStrip({
  title,
  looks,
}: {
  title: string;
  looks: { id: string; label: string; image_url: string; designer_name: string | null; location: string | null; badge: LookDetail["badge"] }[];
}) {
  if (looks.length === 0) return null;
  return (
    <section className="py-8 border-t border-ink/10">
      <h2 className="font-display text-xl md:text-2xl text-ink px-6 md:px-14 mb-4">{title}</h2>
      <div className="flex gap-3 md:gap-4 overflow-x-auto px-6 md:px-14 no-scrollbar">
        {looks.map((look) => (
          <div key={look.id} className="w-40 md:w-52 shrink-0">
            <StyleCard
              look={{
                id: look.id,
                label: look.label,
                image: look.image_url,
                href: `/look/${look.id}`,
                designerName: look.designer_name,
                location: look.location,
                badge: look.badge,
              }}
              aspectClassName="aspect-[3/4]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function LookDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const look = await getLook(id);
  if (!look) notFound();

  const [similar, moreFromDesigner] = await Promise.all([
    getSimilar(look.category, look.id),
    getMoreFromDesigner(look.designer_name, look.id),
  ]);

  const galleryImages = [look.image_url, ...(look.gallery_images ?? [])];
  const hasShopLink = look.href && look.href !== "#";
  const enquiryQuery = new URLSearchParams({ look: look.id, subject: look.label }).toString();

  return (
    <main>
      <div className="px-5 pt-5 flex items-center">
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

      {/* Large image first */}
      <section className="relative w-full aspect-[4/5] md:aspect-[16/9] mt-3 bg-paper-raised">
        <Image src={galleryImages[0]} alt={look.label} fill priority className="object-cover" sizes="100vw" />
      </section>

      {/* Additional photos */}
      {galleryImages.length > 1 && (
        <section className="flex gap-2 overflow-x-auto px-5 py-3 no-scrollbar">
          {galleryImages.slice(1).map((src, i) => (
            <div key={i} className="relative w-24 h-32 shrink-0 rounded overflow-hidden bg-paper-raised">
              <Image src={src} alt={`${look.label} ${i + 2}`} fill className="object-cover" sizes="96px" />
            </div>
          ))}
        </section>
      )}

      {/* Designer info + description */}
      <section className="px-6 md:px-14 pt-6 pb-4">
        <h1 className="font-display text-3xl md:text-4xl text-ink mb-2">{look.label}</h1>
        <div className="flex items-center gap-2 flex-wrap text-sm text-muted mb-5">
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
          <p className="text-ink/80 leading-relaxed mb-5 max-w-2xl">{look.description ?? look.story}</p>
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

      <ScrollStrip title="Similar Styles" looks={similar} />
      <ScrollStrip title="More From This Designer" looks={moreFromDesigner} />

      {/* Actions */}
      <section className="px-6 md:px-14 py-10 border-t border-ink/10">
        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto md:mx-0">
          {hasShopLink && (
            <Link
              href={look.href as string}
              className="col-span-2 flex items-center justify-center h-12 rounded-full bg-ink text-paper text-sm"
            >
              Shop This Look
            </Link>
          )}
          <Link
            href={`/contact?reason=bespoke&${enquiryQuery}`}
            className="flex items-center justify-center h-12 rounded-full bg-brass text-ink text-sm text-center px-3"
          >
            Make Bespoke
          </Link>
          <Link
            href={`/contact?reason=appointment&${enquiryQuery}`}
            className="flex items-center justify-center h-12 rounded-full border border-ink/15 text-ink text-sm text-center px-3"
          >
            Book Appointment
          </Link>
          <Link
            href={`/contact?reason=enquiry&${enquiryQuery}`}
            className="flex items-center justify-center h-12 rounded-full border border-ink/15 text-ink text-sm text-center px-3"
          >
            Make Enquiry
          </Link>
          <LookSaveButton id={look.id} label={look.label} image={look.image_url} />
          <div className="col-span-2">
            <ShareButton label={look.label} />
          </div>
        </div>
      </section>
    </main>
  );
}
