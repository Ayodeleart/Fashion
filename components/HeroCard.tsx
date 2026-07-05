import Link from "next/link";
import type { HeroBanner } from "@/components/Hero";

export default function HeroCard({ banner }: { banner: HeroBanner | null }) {
  if (!banner) return null;

  const title = banner.label ?? "New Arrivals";
  const watermark = title.split(" ")[0]?.toUpperCase() ?? "STYLE";

  return (
    <section className="px-5 pb-6">
      <div className="relative rounded-[28px] overflow-hidden aspect-[4/5] bg-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={banner.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        <div className="absolute top-6 left-6 right-6">
          <h1 className="font-display text-3xl text-white leading-tight">{title}</h1>
          <Link
            href={banner.href ?? "/catalog"}
            className="inline-block mt-4 bg-white text-ink text-sm font-medium rounded-full px-5 py-2.5"
          >
            Shop now
          </Link>
        </div>

        <p
          aria-hidden
          className="absolute bottom-1 left-0 right-0 text-center font-display text-[64px] leading-none text-transparent select-none"
          style={{ WebkitTextStroke: "1.5px rgba(255,255,255,0.85)" }}
        >
          {watermark}
        </p>
      </div>
    </section>
  );
}
