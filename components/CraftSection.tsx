"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function CraftSection({
  image,
  eyebrow,
  heading,
  body,
}: {
  image: string;
  eyebrow: string;
  heading: string;
  body: string;
}) {
  const ref = useScrollReveal<HTMLDivElement>(100);

  return (
    <section
      ref={ref}
      className="bg-paper-raised px-6 md:px-10 py-20 md:py-28 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
    >
      <div data-reveal="image" className="relative aspect-[4/5] overflow-hidden order-2 md:order-1">
        <Image src={image} alt="" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="order-1 md:order-2 max-w-md">
        <p className="eyebrow mb-3" data-reveal="paragraph">
          {eyebrow}
        </p>
        <h2 className="font-display text-3xl md:text-5xl text-ink mb-6" data-reveal="heading">
          {heading}
        </h2>
        <p className="text-muted leading-relaxed" data-reveal="paragraph">
          {body}
        </p>
      </div>
    </section>
  );
}
