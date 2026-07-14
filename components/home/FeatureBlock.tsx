import Link from "next/link";

export type FeatureLook = {
  id: string;
  label: string;
  image: string;
  mediaType: "image" | "video";
  videoUrl: string | null;
  promoText: string | null;
};

/**
 * A full-bleed video or image block the admin can drop anywhere in the
 * Home feed (via feed_layout: "feature" + position). Separate from the
 * top-of-page EditorialHero — this one is for a promo moment mid-scroll,
 * e.g. "after a few looks". Video is always muted/looped/autoplaying.
 */
export default function FeatureBlock({ look }: { look: FeatureLook }) {
  const useVideo = look.mediaType === "video" && look.videoUrl;

  return (
    <Link
      href={`/look/${look.id}`}
      data-reveal="image"
      className="relative block w-full aspect-[4/5] md:aspect-[21/9] overflow-hidden bg-ink -mx-1.5 md:-mx-3"
    >
      {useVideo ? (
        <video
          src={look.videoUrl ?? undefined}
          poster={look.image}
          muted
          autoPlay
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={look.image} alt={look.label} className="absolute inset-0 w-full h-full object-cover" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

      {(look.promoText || look.label) && (
        <div className="absolute bottom-6 left-6 right-6 md:left-14 md:right-14">
          <h2 className="font-display text-paper text-3xl md:text-5xl leading-tight max-w-xl">
            {look.promoText ?? look.label}
          </h2>
        </div>
      )}
    </Link>
  );
}
