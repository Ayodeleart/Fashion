import { getBackdropImage } from "@/lib/backdrop";

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const backdrop = await getBackdropImage();

  return (
    <main className="relative min-h-screen flex items-center overflow-hidden bg-[#0d2420]">
      {backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d2420] via-[#0d2420]/85 to-transparent" />

      <div className="relative z-10 px-6 md:px-16 py-24 max-w-xl">
        <p className="text-brass text-xs tracking-[0.2em] uppercase mb-4">About</p>
        <h1 className="font-display text-4xl md:text-5xl text-paper mb-8 leading-tight">
          Modern African tailoring,<br />made to be worn.
        </h1>
        <p className="text-paper/80 leading-relaxed mb-4">
          AyodeleGold is a tailoring house built around craftsmanship — every piece cut, fitted,
          and finished by hand. Our menswear and womenswear lines are led by two dedicated
          tailors, each bringing years of technique to garments meant for real movement, not just
          a photograph.
        </p>
        <p className="text-paper/80 leading-relaxed">
          We work in rich, considered color and traditional detailing reimagined for a modern
          wardrobe — bespoke when you need it, ready-to-wear when you don't.
        </p>
        <a
          href="/catalog"
          className="inline-block mt-10 text-sm tracking-wide text-paper border border-paper/60 px-6 py-3 rounded-sm hover:bg-paper hover:text-ink transition-colors"
        >
          Shop the Collection
        </a>
      </div>
    </main>
  );
}
