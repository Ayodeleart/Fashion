"use client";

import { useEffect, useRef, useState } from "react";
import { useDominantColor } from "@/hooks/useDominantColor";

export type HeroClip = {
  id: string;
  desktopSrc: string;
  mobileSrc: string;
  poster?: string;
};

type Props = {
  clips: HeroClip[];
  brandName: string;
};

/**
 * Two stacked <video> elements crossfade between clips. When the active
 * clip ends, it fades out while the next one (already playing underneath)
 * fades in. Brand wordmark sits ON TOP of the video (final decision:
 * overlay, not background-cutout) so no alpha-matting pipeline is needed.
 * The section's background color bleeds from the video's live dominant
 * color, sampled on a canvas each clip change — this is the signature
 * element tying the required "upload -> dominant color -> publish"
 * workflow directly into the visual design.
 */
export default function Hero({ clips, brandName }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [bgColor, setBgColor] = useState<string>("22, 48, 42"); // matches --hero-fallback

  const videoARef = useRef<HTMLVideoElement | null>(null);
  const videoBRef = useRef<HTMLVideoElement | null>(null);
  const [showingA, setShowingA] = useState(true);
  const sampleColor = useDominantColor();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const nextIndex = (activeIndex + 1) % clips.length;
  const activeVideo = showingA ? videoARef.current : videoBRef.current;
  const standbyVideo = showingA ? videoBRef.current : videoARef.current;

  // Sample dominant color periodically off the currently-visible video.
  useEffect(() => {
    const el = activeVideo;
    if (!el) return;
    const interval = window.setInterval(() => {
      const rgb = sampleColor(el);
      if (rgb) setBgColor(rgb);
    }, 1500);
    return () => window.clearInterval(interval);
  }, [activeVideo, sampleColor]);

  // Preload + play the standby video so it's ready to crossfade in.
  useEffect(() => {
    const standby = standbyVideo;
    if (!standby) return;
    standby.currentTime = 0;
    standby.load();
    standby.play().catch(() => {});
  }, [activeIndex, standbyVideo]);

  const handleEnded = () => {
    setShowingA((prev) => !prev);
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    document.documentElement.style.setProperty("--hero-live", `rgb(${bgColor})`);
  }, [bgColor]);

  const clipA = clips[showingA ? activeIndex : nextIndex];
  const clipB = clips[showingA ? nextIndex : activeIndex];

  return (
    <section
      className="relative w-full h-[100svh] overflow-hidden flex items-end"
      style={{
        backgroundColor: `rgb(${bgColor})`,
        transition: "background-color 1200ms cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Video layer A */}
      <video
        ref={videoARef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms]"
        style={{ opacity: showingA ? 1 : 0, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
        src={isMobile ? clipA?.mobileSrc : clipA?.desktopSrc}
        poster={clipA?.poster}
        muted
        playsInline
        autoPlay
        onEnded={showingA ? handleEnded : undefined}
      />
      {/* Video layer B */}
      <video
        ref={videoBRef}
        className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1200ms]"
        style={{ opacity: showingA ? 0 : 1, transitionTimingFunction: "cubic-bezier(0.22,1,0.36,1)" }}
        src={isMobile ? clipB?.mobileSrc : clipB?.desktopSrc}
        poster={clipB?.poster}
        muted
        playsInline
        onEnded={!showingA ? handleEnded : undefined}
      />

      {/* Scrim for legibility, kept subtle */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />

      {/* Nav */}
      <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 md:px-10 py-6 text-paper z-10">
        <div className="flex gap-6 text-sm">
          <button className="hover:text-brass transition-colors">Search</button>
          <button className="hover:text-brass transition-colors">Catalog</button>
          <button className="hover:text-brass transition-colors">About</button>
        </div>
        <div className="flex gap-6 text-sm">
          <button className="hover:text-brass transition-colors">Favorites</button>
          <button className="hover:text-brass transition-colors">Cart</button>
        </div>
      </nav>

      {/* Wordmark overlays the video directly (final decision — no cutout/matting) */}
      <h1
        className="font-display absolute top-[18%] left-1/2 -translate-x-1/2 text-white text-[18vw] md:text-[11vw] leading-none tracking-tight select-none z-10"
        style={{ textShadow: "0 2px 40px rgba(0,0,0,0.25)" }}
      >
        {brandName}
      </h1>

      {/* Bottom-left copy block */}
      <div className="relative z-10 px-6 md:px-10 pb-10 md:pb-14 text-paper max-w-md">
        <p className="text-sm md:text-base opacity-90">
          Cut for movement, made to be seen from every angle.
        </p>
      </div>

      {/* Signature seam: a thin color-swatch rule that carries the live
          hero color down into the next section as a visual handoff. */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[3px] z-10"
        style={{
          backgroundColor: `rgb(${bgColor})`,
          transition: "background-color 1200ms cubic-bezier(0.22,1,0.36,1)",
        }}
      />
    </section>
  );
}
