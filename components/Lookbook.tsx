"use client";

import { useState } from "react";
import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import Sheet from "@/components/Sheet";
import SaveButton from "@/components/SaveButton";

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
// Layout is chosen by how many looks are in the chapter, so the page
// doesn't repeat the same grid rhythm every time you scroll — closer to
// flipping through a magazine than browsing a store:
//   1 look   -> full-bleed cinematic spread
//   2 looks  -> side-by-side spread, like a magazine gatefold
//   3 looks  -> asymmetric mosaic — one large, two stacked
//   4+ looks -> a horizontal filmstrip, not a vertical masonry grid
// Tapping any look opens the existing in-page sheet — no new route —
// where the story lives alongside Save and Shop this look.
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
  const [open, setOpen] = useState<LookbookPanel | null>(null);

  const detailSheet = (
    <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.label ?? ""}>
      {open && (
        <div className="space-y-5">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-paper-raised">
            <Image src={open.image} alt={open.label} fill className="object-cover" sizes="100vw" />
          </div>

          {open.story && <p className="text-sm text-muted leading-relaxed">{open.story}</p>}

          <div className="flex items-center gap-3 pt-1">
            <SaveButton
              item={{
                productId: `look-${open.id}`,
                name: open.label,
                price: 0,
                currency: "",
                image: open.image,
                href: open.href,
                kind: "look",
              }}
              className="w-11 h-11 rounded-full border border-ink/15 flex items-center justify-center shrink-0"
            />
            <a
              href={open.href}
              className="flex-1 text-center text-sm font-medium px-5 py-3 rounded-full bg-ink text-paper"
            >
              Shop this look
            </a>
          </div>
        </div>
      )}
    </Sheet>
  );

  // A single tile: image + soft bottom-gradient label, staggered reveal
  // delay by index so a row of tiles settles in one after another
  // instead of popping in all at once.
  function Tile({
    panel,
    index,
    className = "",
    sizes = "(max-width: 768px) 100vw, 33vw",
  }: {
    panel: LookbookPanel;
    index: number;
    className?: string;
    sizes?: string;
  }) {
    return (
      <button
        type="button"
        onClick={() => setOpen(panel)}
        data-reveal="image"
        style={{ transitionDelay: `${index * 90}ms` }}
        className={`group relative overflow-hidden bg-paper-raised text-left w-full ${className}`}
      >
        <Image
          src={panel.image}
          alt={panel.label}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
          sizes={sizes}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <span className="absolute bottom-5 left-5 text-paper font-display text-xl">
          {panel.label}
        </span>
      </button>
    );
  }

  const chapterHeading = (
    <div className="mb-10 md:mb-14 px-6 md:px-10">
      <p className="eyebrow mb-3" data-reveal="paragraph">
        {eyebrow}
      </p>
      <h2 className="font-display text-4xl md:text-6xl text-ink" data-reveal="heading">
        {heading}
      </h2>
    </div>
  );

  // 1 — full-bleed cinematic spread, heading lives inside the image.
  if (panels.length === 1) {
    const panel = panels[0];
    return (
      <section ref={ref} className="bg-paper">
        <button
          type="button"
          onClick={() => setOpen(panel)}
          data-reveal="image"
          className="group relative block h-[85vh] w-full overflow-hidden text-left"
        >
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
        </button>
        {detailSheet}
      </section>
    );
  }

  // 2 — a spread: two tall panels meeting in the middle, gatefold-style.
  if (panels.length === 2) {
    return (
      <section ref={ref} className="bg-paper py-20 md:py-28">
        {chapterHeading}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2 px-6 md:px-10">
          {panels.map((panel, i) => (
            <Tile key={panel.id} panel={panel} index={i} className="aspect-[4/5] md:aspect-[3/4]" sizes="(max-width: 768px) 100vw, 50vw" />
          ))}
        </div>
        {detailSheet}
      </section>
    );
  }

  // 3 — asymmetric mosaic: one large left, two stacked right. Classic
  // editorial page layout, not a uniform grid.
  if (panels.length === 3) {
    const [big, ...rest] = panels;
    return (
      <section ref={ref} className="bg-paper py-20 md:py-28">
        {chapterHeading}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-1 md:gap-2 px-6 md:px-10">
          <Tile panel={big} index={0} className="row-span-2 aspect-[3/4] md:aspect-[3/5]" sizes="(max-width: 768px) 50vw, 50vw" />
          <div className="grid grid-rows-2 gap-1 md:gap-2">
            {rest.map((panel, i) => (
              <Tile key={panel.id} panel={panel} index={i + 1} className="aspect-square" sizes="(max-width: 768px) 50vw, 25vw" />
            ))}
          </div>
        </div>
        {detailSheet}
      </section>
    );
  }

  // 4+ — a horizontal filmstrip you scroll through, not a vertical
  // masonry grid. Deliberately reads as flipping a stack of prints
  // rather than an infinite feed.
  return (
    <section ref={ref} className="bg-paper py-20 md:py-28">
      {chapterHeading}
      <div className="flex gap-3 md:gap-4 px-6 md:px-10 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-2">
        {panels.map((panel, i) => (
          <Tile
            key={panel.id}
            panel={panel}
            index={i}
            className="aspect-[3/4] shrink-0 w-[72vw] md:w-[26vw] snap-start"
            sizes="(max-width: 768px) 72vw, 26vw"
          />
        ))}
      </div>
      {detailSheet}
    </section>
  );
}
