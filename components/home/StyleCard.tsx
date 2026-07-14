import Image from "next/image";
import Link from "next/link";

export type StyleLook = {
  id: string;
  label: string;
  image: string;
  href: string;
  designerName: string | null;
  location: string | null;
  badge: "ready-made" | "bespoke" | "ready+bespoke" | null;
};

const BADGE_LABEL: Record<string, string> = {
  "ready-made": "Ready-Made",
  bespoke: "Bespoke",
  "ready+bespoke": "Ready + Bespoke",
};

function BadgePill({ badge }: { badge: StyleLook["badge"] }) {
  if (!badge) return null;
  return (
    <span className="inline-block px-2.5 py-0.5 rounded-full bg-paper/90 text-ink text-[10px] tracking-wide uppercase">
      {BADGE_LABEL[badge]}
    </span>
  );
}

/**
 * The card is deliberately bare — image, designer, location, badge.
 * No price, no cart. Aspect ratio is passed in by the parent layout
 * (full / portrait / dramatic / collage), except in the masonry variant
 * where the image keeps its natural height.
 */
export function StyleCard({
  look,
  aspectClassName,
  priority,
}: {
  look: StyleLook;
  // Full literal Tailwind class, e.g. "aspect-[3/4]" — must be a complete
  // string defined where Tailwind's content scanner can see it (see the
  // ASPECT constants in HomeFeed.tsx). Omit for natural height (masonry).
  aspectClassName?: string;
  priority?: boolean;
}) {
  return (
    <Link
      href={look.href}
      data-reveal="image"
      className={`group relative block overflow-hidden bg-paper-raised ${aspectClassName ?? ""}`}
    >
      {aspectClassName ? (
        <Image
          src={look.image}
          alt={look.label}
          fill
          priority={priority}
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={look.image}
          alt={look.label}
          className="w-full h-auto block transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          loading="lazy"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {(look.designerName || look.location || look.badge) && (
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <div className="min-w-0">
            {look.designerName && (
              <p className="text-paper text-sm font-display truncate drop-shadow-sm">
                {look.designerName}
              </p>
            )}
            {look.location && (
              <p className="text-paper/80 text-[11px] font-body truncate">{look.location}</p>
            )}
          </div>
          <BadgePill badge={look.badge} />
        </div>
      )}
    </Link>
  );
}
