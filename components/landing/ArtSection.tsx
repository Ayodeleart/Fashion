type ArtSection = { image_url: string | null; quote_top: string; quote_bottom: string } | null;

export default function ArtSection({ section }: { section: ArtSection }) {
  const quoteTop = section?.quote_top || "WHERE ELEGANCE AND FASHION BECOMES ART";
  const quoteBottom = section?.quote_bottom || "MEETS ELEGANCE AND FASHION BECOMES ART";
  const imageUrl = section?.image_url;

  return (
    <section className="bg-ink py-16 md:py-24 px-6 flex justify-center">
      <div className="relative w-full max-w-md aspect-square">
        <svg viewBox="0 0 400 400" className="absolute inset-0 w-full h-full animate-[spin_40s_linear_infinite]">
          <defs>
            <path id="art-circle-top" d="M200,200 m-160,0 a160,160 0 1,1 320,0" />
            <path id="art-circle-bottom" d="M40,200 a160,160 0 1,1 320,0" />
          </defs>
          <text fontSize="15" fill="#f3f1ec" letterSpacing="2" style={{ fontFamily: "var(--font-landing-display)" }}>
            <textPath href="#art-circle-top" startOffset="2%">
              {quoteTop}
            </textPath>
          </text>
          <text fontSize="15" fill="#f3f1ec" letterSpacing="2" style={{ fontFamily: "var(--font-landing-display)" }}>
            <textPath href="#art-circle-bottom" startOffset="52%">
              {quoteBottom}
            </textPath>
          </text>
        </svg>

        <div className="absolute inset-[22%] rounded-full overflow-hidden bg-paper/10">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="w-full h-full object-cover grayscale" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-paper/40 text-xs text-center px-4">
              Upload a portrait in admin (Landing: Fashion Becomes Art)
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
