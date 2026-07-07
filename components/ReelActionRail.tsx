"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSupabase } from "@/lib/supabase";
import { LikeIcon, CommentIcon, SendIcon } from "@/components/ReelIcons";
import Sheet from "@/components/Sheet";
import ConciergeContactForm from "@/components/ConciergeContactForm";

type Comment = { id: string; name: string; comment: string; created_at: string };

function formatCount(n: number) {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${(n / 1000).toFixed(n % 1000 >= 100 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}

export default function ReelActionRail({
  reelId,
  initialLikeCount,
  caption,
}: {
  reelId: string;
  initialLikeCount: number;
  caption: string | null;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const { data: row } = await supabase
        .from("ariana_reel_likes")
        .select("id")
        .eq("reel_id", reelId)
        .eq("user_id", data.user.id)
        .maybeSingle();
      if (row) setLiked(true);
    });
  }, [reelId]);

  async function toggleLike() {
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      router.push(`/account/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optimistic update, since the trigger-maintained count lives server
    // side and we don't want a network round trip before the heart fills.
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => c + (wasLiked ? -1 : 1));

    if (wasLiked) {
      const { error } = await supabase
        .from("ariana_reel_likes")
        .delete()
        .eq("reel_id", reelId)
        .eq("user_id", data.user.id);
      if (error) {
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } else {
      const { error } = await supabase.from("ariana_reel_likes").insert({ reel_id: reelId, user_id: data.user.id });
      if (error) {
        setLiked(false);
        setLikeCount((c) => c - 1);
      }
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-5 text-white">
        <button onClick={toggleLike} aria-label={liked ? "Unlike" : "Like"} className="flex flex-col items-center gap-1">
          <LikeIcon filled={liked} className={`w-7 h-7 ${liked ? "text-red-500" : "text-white"}`} />
          <span className="text-xs drop-shadow">{formatCount(likeCount)}</span>
        </button>

        <button onClick={() => setCommentsOpen(true)} aria-label="Comments" className="flex flex-col items-center">
          <CommentIcon className="w-7 h-7" />
        </button>

        <button onClick={() => setSendOpen(true)} aria-label="Send to admin" className="flex flex-col items-center">
          <SendIcon className="w-7 h-7" />
        </button>
      </div>

      <CommentsSheet reelId={reelId} open={commentsOpen} onClose={() => setCommentsOpen(false)} />

      <Sheet open={sendOpen} onClose={() => setSendOpen(false)} title="Ask about this">
        <ConciergeContactForm
          source="reel_send"
          reelId={reelId}
          defaultMessage={caption ? `Interested in: ${caption}` : ""}
          placeholder="What would you like to know?"
          onSent={() => setSendOpen(false)}
        />
      </Sheet>
    </>
  );
}

function CommentsSheet({ reelId, open, onClose }: { reelId: string; open: boolean; onClose: () => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  useEffect(() => {
    if (!open) return;
    const supabase = getSupabase();
    setLoading(true);
    Promise.all([
      supabase
        .from("ariana_reel_comments")
        .select("id, name, comment, created_at")
        .eq("reel_id", reelId)
        .order("created_at", { ascending: false }),
      supabase.auth.getUser(),
    ]).then(([{ data }, { data: userData }]) => {
      setComments((data as Comment[]) ?? []);
      setNeedsAuth(!userData.user);
      setLoading(false);
    });
  }, [open, reelId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.trim() || posting) return;
    setPosting(true);
    const supabase = getSupabase();
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
      setNeedsAuth(true);
      setPosting(false);
      return;
    }
    const name = data.user.email?.split("@")[0] ?? "Customer";
    const { data: inserted, error } = await supabase
      .from("ariana_reel_comments")
      .insert({ reel_id: reelId, user_id: data.user.id, name, comment: draft.trim() })
      .select("id, name, comment, created_at")
      .single();
    if (!error && inserted) {
      setComments((c) => [inserted as Comment, ...c]);
      setDraft("");
    }
    setPosting(false);
  }

  return (
    <Sheet open={open} onClose={onClose} title="Comments">
      <div className="flex flex-col gap-4">
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted">No comments yet — be the first.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {comments.map((c) => (
              <div key={c.id}>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-sm text-muted">{c.comment}</p>
              </div>
            ))}
          </div>
        )}

        {needsAuth ? (
          <p className="text-xs text-muted">Sign in to leave a comment.</p>
        ) : (
          <form onSubmit={handlePost} className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 bg-paper-raised rounded-full px-4 py-2.5 text-sm outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              disabled={posting || !draft.trim()}
              className="text-sm font-medium text-brass disabled:opacity-50"
            >
              Post
            </button>
          </form>
        )}
      </div>
    </Sheet>
  );
}
