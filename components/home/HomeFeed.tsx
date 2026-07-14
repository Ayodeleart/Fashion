"use client";

import { useMemo, useState } from "react";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import StyleFilterBar from "./StyleFilterBar";
import EditorialDivider from "./EditorialDivider";
import { StyleCard, type StyleLook } from "./StyleCard";
import FeatureBlock from "./FeatureBlock";

export type FeedLook = StyleLook & {
  category: string | null;
  styleTags: string[];
  feedLayout: "full" | "portrait" | "masonry" | "dramatic" | "collage" | "feature" | null;
  isEditorialBreak: boolean;
  editorialLabel: string | null;
  mediaType: "image" | "video";
  videoUrl: string | null;
  promoText: string | null;
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

// The base rhythm for looks that DON'T carry an explicit feed_layout
// override, repeated with a light variation each cycle so it doesn't
// feel like a fixed template. Numbers are batch sizes.
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

// feed_layout values that always render as their own single-item block,
// pulled out of line the moment we reach them — never grouped into a
// portrait/masonry/collage batch with neighbors. This is what lets an
// admin drop a "feature" (video/promo) block at an exact position.
const SINGULAR_OVERRIDES = new Set(["full", "dramatic", "feature"]);

type Block =
  | { kind: "divider"; label: string }
  | { kind: "full"; looks: FeedLook[] }
  | { kind: "portrait2"; looks: FeedLook[] }
  | { kind: "masonry"; looks: FeedLook[] }
  | { kind: "dramatic"; looks: FeedLook[] }
  | { kind: "feature"; looks: FeedLook[] }
  | { kind: "collage3"; looks: FeedLook[] };

const BREAK_EVERY = 17; // within the 15-20 spec range

function buildBlocks(looks: FeedLook[]): Block[] {
  const blocks: Block[] = [];
  let cycleIndex = 0;
  let sinceLastBreak = 0;
  let dividerIndex = 0;
  let i = 0;

  function pushDividerIfDue(look: FeedLook, countAdded: number) {
    sinceLastBreak += countAdded;
    if (look.isEditorialBreak && look.editorialLabel) {
      blocks.push({ kind: "divider", label: look.editorialLabel });
      sinceLastBreak = 0;
    } else if (sinceLastBreak >= BREAK_EVERY) {
      blocks.push({ kind: "divider", label: DIVIDER_LABELS[dividerIndex % DIVIDER_LABELS.length] });
      dividerIndex += 1;
      sinceLastBreak = 0;
    }
  }

  while (i < looks.length) {
    const current = looks[i];

    // Admin-pinned single block (full / dramatic / feature) — respect
    // its exact position, don't fold it into a batch.
    if (current.feedLayout && SINGULAR_OVERRIDES.has(current.feedLayout)) {
      blocks.push({ kind: current.feedLayout as "full" | "dramatic" | "feature", looks: [current] });
      i += 1;
      pushDividerIfDue(current, 1);
      continue;
    }

    // Otherwise, take the next rhythm-sized batch, but stop the batch
    // early if we run into a pinned look so it doesn't get swallowed.
    const rhythm = cycleIndex % 2 === 0 ? RHYTHM : RHYTHM_VARIANT;
    const slot = rhythm[cycleIndex % rhythm.length];
    const batch: FeedLook[] = [];
    while (batch.length < slot.count && i < looks.length) {
      const next = looks[i];
      if (next.feedLayout && SINGULAR_OVERRIDES.has(next.feedLayout)) break;
      batch.push(next);
      i += 1;
    }
    if (batch.length === 0) continue; // next iteration handles the pinned look

    const flaggedBreak = batch.find((l) => l.isEditorialBreak && l.editorialLabel);

    blocks.push({ kind: slot.type, looks: batch } as Block);
    cycleIndex += 1;
    sinceLastBreak += batch.length;

    if (flaggedBreak) {
      blocks.push({ kind: "divider", label: flaggedBreak.editorialLabel as string });
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

      <div className="px-1.5 md:px-3 py-4 md:py-6 space-y-1 md:space-y-1.5">
        {blocks.length === 0 && (
          <p className="text-muted text-sm py-20 text-center">No looks in this edit yet.</p>
        )}

        {blocks.map((block, idx) => {
          if (block.kind === "divider") {
            return <EditorialDivider key={`divider-${idx}`} label={block.label} />;
          }

          if (block.kind === "feature") {
            const look = block.looks[0];
            return <FeatureBlock key={look.id} look={look} />;
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
            return <StyleCard key={look.id} look={look} aspectClassName={aspectFor(look, ASPECT.dramatic)} />;
          }

          if (block.kind === "portrait2") {
            return (
              <div key={`portrait-${idx}`} className="grid grid-cols-2 gap-1 md:gap-1.5">
                {block.looks.map((look) => (
                  <StyleCard key={look.id} look={look} aspectClassName={aspectFor(look, ASPECT.portrait)} />
                ))}
              </div>
            );
          }

          if (block.kind === "collage3") {
            const [big, small1, small2] = block.looks;
            return (
              <div key={`collage-${idx}`} className="grid grid-cols-2 gap-1 md:gap-1.5">
                {big && (
                  <div className="row-span-2">
                    <StyleCard look={big} aspectClassName={ASPECT.collageBig} />
                  </div>
                )}
                <div className="grid grid-rows-2 gap-1 md:gap-1.5">
                  {small1 && <StyleCard look={small1} aspectClassName={ASPECT.collageSmall} />}
                  {small2 && <StyleCard look={small2} aspectClassName={ASPECT.collageSmall} />}
                </div>
              </div>
            );
          }

          if (block.kind === "masonry") {
            return (
              <div key={`masonry-${idx}`} className="columns-2 md:columns-3 gap-1 md:gap-1.5 space-y-1 md:space-y-1.5">
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
