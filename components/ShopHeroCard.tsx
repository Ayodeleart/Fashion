type ShopHeroBanner = {
  id: string;
  label: string | null;
  imageUrl: string;
  href: string | null;
};

/**
 * The rounded hero card at the top of the mobile shop home (/catalog).
 * Reads ariana_shop_hero — completely separate from ariana_hero_banners
 * (landing page, /landing) and from the lookbook table (Home, /).
 */
export default function ShopHeroCard({ banners }: { banners: ShopHeroBanner[] }) {
  if (banners.length === 0) return null;

  return (
    <div className="px-5 md:px-10 lg:px-16 pt-4 max-w-[1400px] mx-auto">
      <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory no-scrollbar">
        {banners.map((banner) => (
          <div
            key={banner.id}
            className="relative shrink-0 w-[78%] md:w-[38%] lg:w-[30%] aspect-[4/5] rounded-2xl overflow-hidden snap-center bg-paper-raised"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={banner.imageUrl} alt={banner.label ?? "Shop"} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4">
              {banner.label && (
                <p className="font-display text-paper text-xl mb-2 leading-tight">{banner.label}</p>
              )}
              <a
                href={banner.href ?? "/catalog"}
                className="inline-flex items-center h-9 px-4 rounded-full bg-paper text-ink text-xs tracking-wide uppercase"
              >
                Shop Now
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
