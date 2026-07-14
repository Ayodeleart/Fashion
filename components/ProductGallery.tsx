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
  const [lightboxOpen, setLightboxOpen] = useState(false);
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
        onClick={() => active && setLightboxOpen(true)}
        data-reveal="image"
      >
        {active ? (
          <Image
            src={active.url}
            alt={productName}
            fill
            className="object-cover cursor-zoom-in"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-muted">No image</div>
        )}

        <div className="absolute top-3 right-3" onClick={(e) => e.stopPropagation()}>
          <SaveButton item={saveItem} className="w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shrink-0" />
        </div>

        {/* Desktop arrow controls — swipe covers mobile, this covers desktop */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex - 1);
              }}
              aria-label="Previous image"
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-black items-center justify-center hover:bg-white transition-colors"
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goTo(activeIndex + 1);
              }}
              aria-label="Next image"
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-black items-center justify-center hover:bg-white transition-colors"
            >
              →
            </button>
          </>
        )}
        {/* Dot indicators — the main image itself is the swipeable/tappable
            surface (touch + click handlers above); no separate thumbnail
            row here, matching the reference pattern. */}
        {images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5" onClick={(e) => e.stopPropagation()}>
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to image ${i + 1}`}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && active && (
        <div className="fixed inset-0 z-[60] bg-paper flex flex-col">
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Close"
            className="absolute z-10 w-9 h-9 rounded-full bg-ink/5 text-ink flex items-center justify-center"
            style={{ top: "calc(env(safe-area-inset-top) + 0.75rem)", left: "1rem" }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>

          <div
            className="relative flex-1"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <Image src={active.url} alt={productName} fill className="object-contain" sizes="100vw" />

            {images.length > 1 && (
              <button
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Next image"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-ink/5 text-ink items-center justify-center hover:bg-ink/10 transition-colors"
              >
                →
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div
              className="flex justify-center gap-2 px-4 py-3 shrink-0"
              style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
            >
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => goTo(i)}
                  className={`relative w-14 h-16 shrink-0 rounded-md overflow-hidden bg-paper-raised transition-opacity ${
                    i === activeIndex ? "ring-2 ring-ink" : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image src={img.url} alt="" fill className="object-cover" sizes="56px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
