"use client";

import { useRef, useState } from "react";
import Image from "next/image";
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
          <div key={i} className="relative w-full h-full shrink-0 snap-center">
            <Image
              src={src}
              alt={`${label} ${i + 1}`}
              fill
              className="object-cover"
              sizes="100vw"
              // Only the first slide loads eagerly — everything else is
              // genuinely off-screen in the horizontal track, so there's
              // no reason to pull full-resolution photos for slides the
              // person hasn't swiped to yet. Uploaded photography here
              // runs full-res; without this, a look with several gallery
              // images loads all of them, full-size, unoptimized, the
              // instant the page opens — the kind of memory spike that
              // gets a WKWebView's content process killed on a phone.
              priority={i === 0}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </div>
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
