import Image from "next/image";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export type LookbookPanel = {
  id: string;
  label: string;
  image: string;
  href: string;
  story?: string;
};

// A single chapter of the style book (e.g. "Wedding inspiration",
// "Luxury aso oke"). Home renders one of these per category — see
// CATEGORY_COPY in app/page.tsx for the eyebrow/heading per category.
//
// Layout is decided by how many looks are in the chapter, not by a
// separate admin toggle: one photo reads as a single cinematic feature
// (full-bleed, taller, like a magazine spread), more than one reads as
// a stacked feed of full-width images. On mobile every chapter is a
// single column regardless — this only changes desktop's column count
// and the single-photo case's presentation everywhere.
export default function Lookbook({
  eyebrow,
  heading,
  panels,
}: {
  eyebrow: string;
  heading: string;
  panels: LookbookPanel[];
}) {
  const ref = useScrollReveal<HTMLDivElement>(100);

  if (panels.length === 1) {
    const panel = panels[0];
    return (
      <section ref={ref} className="bg-paper">
        <Link href={`/style/${panel.id}`} className="group relative block h-[85vh] w-full overflow-hidden" data-reveal="image">
          <Image
            src={panel.image}
            alt={panel.label}
            fill
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-transparent" />
          <div className="absolute bottom-8 left-6 right-6 md:left-12">
            <p className="text-paper/80 text-xs tracking-[0.2em] uppercase mb-2">{eyebrow}</p>
            <h2 className="font-display text-3xl md:text-5xl text-paper leading-tight">{heading}</h2>
          </div>
        </Link>
      </section>
    );
  }

  return (
    <section ref={ref} className="bg-paper px-6 md:px-10 py-20 md:py-28">
      <div className="mb-10 md:mb-14">
        <p className="eyebrow mb-3" data-reveal="paragraph">
          {eyebrow}
        </p>
        <h2 className="font-display text-4xl md:text-6xl text-ink" data-reveal="heading">
          {heading}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {panels.map((panel) => (
          <Link
            key={panel.id}
            href={`/style/${panel.id}`}
            data-reveal="image"
            className="group relative aspect-[3/4] overflow-hidden bg-paper-raised block"
          >
            <Image
              src={panel.image}
              alt={panel.label}
              fill
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-5 left-5 text-paper font-display text-xl">
              {panel.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
