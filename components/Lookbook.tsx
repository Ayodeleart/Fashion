"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export type LookbookPanel = {
  id: string;
  label: string;
  image: string;
  href: string;
};

export default function Lookbook({ panels }: { panels: LookbookPanel[] }) {
  const ref = useScrollReveal<HTMLDivElement>(100);

  return (
    <section ref={ref} className="bg-paper px-6 md:px-10 py-20 md:py-28">
      <div className="mb-10 md:mb-14">
        <p className="eyebrow mb-3" data-reveal="paragraph">
          The Edit
        </p>
        <h2
          className="font-display text-4xl md:text-6xl text-ink"
          data-reveal="heading"
        >
          Three ways to wear the season
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {panels.map((panel) => (
          <a
            key={panel.id}
            href={panel.href}
            data-reveal="image"
            className="group relative aspect-[3/4] overflow-hidden bg-paper-raised"
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
          </a>
        ))}
      </div>
    </section>
  );
}
