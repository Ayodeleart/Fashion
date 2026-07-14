"use client";

import { useMemo, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import StyleFilterBar from "./StyleFilterBar";
import EditorialDivider from "./EditorialDivider";
import { StyleCard, type StyleLook } from "./StyleCard";

export type FeedLook = StyleLook & {
  category: string | null;
  styleTags: string[];
  feedLayout: "full" | "portrait" | "masonry" | "dramatic" | "collage" | null;
  isEditorialBreak: boolean;
  editorialLabel: string | null;
};

function normalizeTag(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

// Literal Tailwind classes — defined here so the content scanner picks
// them up (see the comment on StyleCard's aspectClassName prop).
const ASPECT = {
  full: "aspect-[16/11]",
  portrait: "aspect-[3/4]",
  dramatic: "aspect-[4/5]",
  collageBig: "aspect-[3/4]",
  collageSmall: "aspect-[1/1]",
};

const DIVIDER_LABELS = [
  "Wedding Collection",
  "Luxury Collection",
  "Celebrity Inspiration",
  "Corporate Edit",
  "Traditional Styles",
];

// The base rhythm, repeated with a light variation each cycle so it
// doesn't feel like a fixed template. Numbers are batch sizes.
const RHYTHM: Array<{ type: "full" | "portrait2" | "masonry" | "dramatic" | "collage3"; count: number }> = [
  { type: "full", count: 1 },
  { type: "portrait2", count: 2 },
  { type: "masonry", count: 5 },
  { type: "dramatic", count: 1 },
  { type: "collage3", count: 3 },
];
const RHYTHM_VARIANT: typeof RHYTHM = [
  { type: "dramatic", count: 1 },
  { type: "masonry", count: 4 },
  { type: "portrait2", count: 2 },
  { type: "collage3", count: 3 },
  { type: "full", count: 1 },
];

type Block =
  | { kind: "divider"; label: string }
  | { kind: "full"; looks: FeedLook[] }
  | { kind: "portrait2"; looks: FeedLook[] }
  | { kind: "masonry"; looks: FeedLook[] }
  | { kind: "dramatic"; looks: FeedLook[] }
  | { kind: "collage3"; looks: FeedLook[] };

const BREAK_EVERY = 17; // within the 15-20 spec range

function buildBlocks(looks: FeedLook[]): Block[] {
  const blocks: Block[] = [];
  let cycleIndex = 0;
  let sinceLastBreak = 0;
  let dividerIndex = 0;
  let i = 0;

  while (i < looks.length) {
    const rhythm = cycleIndex % 2 === 0 ? RHYTHM : RHYTHM_VARIANT;
    const slot = rhythm[cycleIndex % rhythm.length];

    const batch = looks.slice(i, i + slot.count);
    if (batch.length === 0) break;

    // An explicit admin-flagged break takes priority over the auto count.
    const flaggedBreak = batch.find((l) => l.isEditorialBreak);

    blocks.push({ kind: slot.type, looks: batch } as Block);
    i += batch.length;
    sinceLastBreak += batch.length;
    cycleIndex += 1;

    if (flaggedBreak?.editorialLabel) {
      blocks.push({ kind: "divider", label: flaggedBreak.editorialLabel });
      sinceLastBreak = 0;
    } else if (sinceLastBreak >= BREAK_EVERY && i < looks.length) {
      blocks.push({ kind: "divider", label: DIVIDER_LABELS[dividerIndex % DIVIDER_LABELS.length] });
      dividerIndex += 1;
      sinceLastBreak = 0;
    }
  }

  return blocks;
}

function aspectFor(look: FeedLook, fallback: string) {
  if (look.feedLayout && look.feedLayout in ASPECT) {
    return (ASPECT as Record<string, string>)[look.feedLayout];
  }
  return fallback;
}

export default function HomeFeed({ looks }: { looks: FeedLook[] }) {
  const [filter, setFilter] = useState("All");
  const revealRef = useScrollReveal<HTMLDivElement>(90);

  const filtered = useMemo(() => {
    if (filter === "All") return looks;
    const needle = normalizeTag(filter);
    if (needle === "trending" || needle === "editor's-pick") {
      // No dedicated flag for these yet — falls back to showing
      // everything rather than an empty feed.
      return looks;
    }
    return looks.filter((look) => {
      const category = look.category ? normalizeTag(look.category) : null;
      if (category === needle) return true;
      return look.styleTags.some((tag) => normalizeTag(tag) === needle);
    });
  }, [filter, looks]);

  const blocks = useMemo(() => buildBlocks(filtered), [filtered]);

  return (
    <div ref={revealRef}>
      <StyleFilterBar active={filter} onChange={setFilter} />

      <div className="px-6 md:px-14 py-10 md:py-14 space-y-3 md:space-y-4">
        {blocks.length === 0 && (
          <p className="text-muted text-sm py-20 text-center">No looks in this edit yet.</p>
        )}

        {blocks.map((block, idx) => {
          if (block.kind === "divider") {
            return <EditorialDivider key={`divider-${idx}`} label={block.label} />;
          }

          if (block.kind === "full") {
            const look = block.looks[0];
            return (
              <StyleCard
                key={look.id}
                look={look}
                aspectClassName={aspectFor(look, ASPECT.full)}
                priority={idx === 0}
              />
            );
          }

          if (block.kind === "dramatic") {
            const look = block.looks[0];
            return (
              <div key={look.id} className="md:px-8">
                <StyleCard look={look} aspectClassName={aspectFor(look, ASPECT.dramatic)} />
              </div>
            );
          }

          if (block.kind === "portrait2") {
            return (
              <div key={`portrait-${idx}`} className="grid grid-cols-2 gap-3 md:gap-4">
                {block.looks.map((look) => (
                  <StyleCard key={look.id} look={look} aspectClassName={aspectFor(look, ASPECT.portrait)} />
                ))}
              </div>
            );
          }

          if (block.kind === "collage3") {
            const [big, small1, small2] = block.looks;
            return (
              <div key={`collage-${idx}`} className="grid grid-cols-2 gap-3 md:gap-4">
                {big && (
                  <div className="row-span-2">
                    <StyleCard look={big} aspectClassName={ASPECT.collageBig} />
                  </div>
                )}
                <div className="grid grid-rows-2 gap-3 md:gap-4">
                  {small1 && <StyleCard look={small1} aspectClassName={ASPECT.collageSmall} />}
                  {small2 && <StyleCard look={small2} aspectClassName={ASPECT.collageSmall} />}
                </div>
              </div>
            );
          }

          if (block.kind === "masonry") {
            return (
              <div key={`masonry-${idx}`} className="columns-2 md:columns-3 gap-3 md:gap-4 space-y-3 md:space-y-4">
                {block.looks.map((look) => (
                  <div key={look.id} className="break-inside-avoid">
                    <StyleCard look={look} />
                  </div>
                ))}
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
