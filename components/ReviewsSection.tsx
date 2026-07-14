"use client";

import { useMemo, useState } from "react";
import { getSupabase } from "@/lib/supabase";

export type Review = {
  id: string;
  rating: number;
  fit_feedback: "small" | "true_to_size" | "large" | null;
  title: string | null;
  body: string | null;
  author_name: string;
  helpful_count: number;
  created_at: string;
};

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5" style={{ fontSize: size }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= Math.round(rating) ? "text-brass" : "text-ink/15"}>
          ★
        </span>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function ReviewsSection({ reviews }: { productId: string; reviews: Review[] }) {
  const [expanded, setExpanded] = useState(false);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const { average, fitCounts } = useMemo(() => {
    if (reviews.length === 0) return { average: 0, fitCounts: { small: 0, true_to_size: 0, large: 0 } };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const fitCounts = { small: 0, true_to_size: 0, large: 0 };
    for (const r of reviews) {
      if (r.fit_feedback) fitCounts[r.fit_feedback]++;
    }
    return { average: sum / reviews.length, fitCounts };
  }, [reviews]);

  if (reviews.length === 0) return null;

  const fitTotal = fitCounts.small + fitCounts.true_to_size + fitCounts.large;
  const visible = expanded ? reviews : reviews.slice(0, 2);

  async function markHelpful(id: string) {
    if (helpfulIds.has(id)) return;
    setHelpfulIds((prev) => new Set(prev).add(id));
    await getSupabase().rpc("mark_review_helpful", { review_id: id });
  }

  return (
    <section className="mt-10 pt-8 border-t border-ink/10">
      <h2 className="text-xs tracking-[0.15em] font-medium text-ink/60 mb-3">REVIEWS</h2>

      <div className="flex items-center gap-2 mb-1">
        <span className="text-2xl font-medium">{average.toFixed(1)}</span>
        <Stars rating={average} size={18} />
      </div>
      <p className="text-sm text-muted mb-6">({reviews.length} reviews)</p>

      {fitTotal > 0 && (
        <div className="mb-8">
          <div className="flex h-1.5 rounded-full overflow-hidden bg-ink/10">
            <div className="bg-ink/70" style={{ width: `${(fitCounts.small / fitTotal) * 100}%` }} />
            <div className="bg-ink" style={{ width: `${(fitCounts.true_to_size / fitTotal) * 100}%` }} />
            <div className="bg-ink/70" style={{ width: `${(fitCounts.large / fitTotal) * 100}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted mt-2">
            <span>Small</span>
            <span>True to size</span>
            <span>Large</span>
          </div>
        </div>
      )}

      <ul className="space-y-6">
        {visible.map((r) => (
          <li key={r.id} className="pb-6 border-b border-ink/10 last:border-0">
            <div className="flex items-center justify-between mb-1.5">
              <Stars rating={r.rating} />
              <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
            </div>
            {r.title && <p className="font-medium text-sm mb-1">{r.title}</p>}
            {r.fit_feedback && (
              <p className="text-xs text-muted mb-1">
                Fit: {r.fit_feedback === "true_to_size" ? "True to size" : r.fit_feedback === "small" ? "Runs small" : "Runs large"}
              </p>
            )}
            {r.body && <p className="text-sm text-ink/80 mb-2">{r.body}</p>}
            <p className="text-sm font-medium mb-2">- {r.author_name}</p>
            <button
              type="button"
              onClick={() => markHelpful(r.id)}
              className="inline-flex items-center gap-1.5 text-xs border border-ink/15 rounded-full px-3 py-1.5 hover:border-ink/40 transition-colors"
            >
              👍 Helpful ({r.helpful_count + (helpfulIds.has(r.id) ? 1 : 0)})
            </button>
          </li>
        ))}
      </ul>

      {reviews.length > 2 && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full mt-2 text-sm font-medium border border-ink/20 rounded-full py-3 hover:border-ink/40 transition-colors"
        >
          {expanded ? "Show fewer reviews" : `See all ${reviews.length} reviews`}
        </button>
      )}
    </section>
  );
}
