"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import SaveButton from "@/components/SaveButton";

type GalleryImage = { url: string };

export default function ProductGallery({
  images,
  productName,
  saveItem,
}: {
  images: GalleryImage[];
  productName: string;
  saveItem: {
    productId: string;
    name: string;
    price: number;
    currency: string;
    image: string;
    href: string;
  };
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const active = images[activeIndex];

  function goTo(index: number) {
    setActiveIndex(((index % images.length) + images.length) % images.length);
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 40;
    if (delta > SWIPE_THRESHOLD) goTo(activeIndex - 1);
    else if (delta < -SWIPE_THRESHOLD) goTo(activeIndex + 1);
    touchStartX.current = null;
  }

  return (
    <div>
      <div
        className="relative aspect-[3/4] md:aspect-[4/5] rounded-2xl md:rounded-lg overflow-hidden bg-paper-raised mb-3"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-reveal="image"
      >
        {active ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
        )}

        <div className="absolute top-3 right-3">
          <SaveButton item={saveItem} className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shrink-0" />
        </div>

        {/* Desktop arrow controls — swipe covers mobile, this covers desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Previous image"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 items-center justify-center hover:bg-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Next image"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 items-center justify-center hover:bg-white transition-colors"
            >
              →
            </button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          {images.map((img, i) => (
            <button
              key={img.url}
              onClick={() => goTo(i)}
              className={`relative w-16 h-20 md:w-20 md:h-24 shrink-0 rounded-lg overflow-hidden bg-paper-raised transition-opacity ${
                i === activeIndex ? "ring-2 ring-ink" : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
