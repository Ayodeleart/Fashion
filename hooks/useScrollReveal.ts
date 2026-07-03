"use client";

import { useEffect, useRef } from "react";

/**
 * Attaches to a container and reveals any descendant with a [data-reveal]
 * attribute, once, when ~20% of that element is visible. Children are
 * staggered 80-120ms apart in DOM order — matches the locked animation spec:
 * one-time triggers, 15-25% threshold, no scroll hijacking, cubic-bezier(0.22,1,0.36,1).
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  staggerMs = 100
) {
  const containerRef = useRef<T | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>("[data-reveal]")
    );
    if (targets.length === 0) return;

    // Respect reduced motion: reveal everything immediately, skip observing.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const order = new Map(targets.map((el, i) => [el, i]));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          const index = order.get(el) ?? 0;
          const delay = (index % 8) * staggerMs; // cap stagger group at 8 siblings
          window.setTimeout(() => {
            el.classList.add("is-visible");
          }, delay);
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.2, // fires at ~20%, within the 15-25% spec range
        rootMargin: "0px 0px -10% 0px",
      }
    );

    targets.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [staggerMs]);

  return containerRef;
}
