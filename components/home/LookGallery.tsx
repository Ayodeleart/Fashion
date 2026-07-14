"use client";

import { useRef, useState } from "react";
import SaveButton from "@/components/SaveButton";

export default function LookGallery({
  id,
  label,
  images,
}: {
  id: string;
  label: string;
  images: string[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  function handleScroll() {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / track.clientWidth);
    setActive(index);
  }

  return (
    <div className="relative w-full">
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex w-full aspect-[4/5] md:aspect-[16/9] overflow-x-auto snap-x snap-mandatory no-scrollbar"
      >
        {images.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt={`${label} ${i + 1}`}
            className="w-full h-full object-cover shrink-0 snap-center"
          />
        ))}
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
          {images.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-paper" : "w-1.5 bg-paper/50"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute top-3 right-3">
        <SaveButton
          item={{
            productId: id,
            name: label,
            price: 0,
            currency: "",
            image: images[0],
            href: `/look/${id}`,
            kind: "look",
          }}
          className="w-10 h-10 rounded-full bg-black/35 backdrop-blur-sm flex items-center justify-center text-paper"
        />
      </div>
    </div>
  );
}
