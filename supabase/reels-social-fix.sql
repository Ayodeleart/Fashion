-- Reels social features: likes (persisted, signed-in only, same pattern
-- as cart/saved), comments (public read, signed-in write), and routing
-- the reel "send" button into the existing contact-messages inbox.

alter table ariana_reels add column if not exists like_count int not null default 0;

create table if not exists ariana_reel_likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reel_id uuid not null references ariana_reels(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, reel_id)
);

alter table ariana_reel_likes enable row level security;

drop policy if exists "Users manage own reel likes" on ariana_reel_likes;
create policy "Users manage own reel likes"
  on ariana_reel_likes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_ariana_reel_likes_reel on ariana_reel_likes(reel_id);

-- Keeps ariana_reels.like_count accurate regardless of which client did
-- the (un)liking — security definer so it can update the reels row even
-- though the RLS policy above only lets a user touch their own like row.
create or replace function ariana_reel_like_count_sync()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update ariana_reels set like_count = like_count + 1 where id = new.reel_id;
    return new;
  elsif tg_op = 'DELETE' then
    update ariana_reels set like_count = greatest(like_count - 1, 0) where id = old.reel_id;
    return old;
  end if;
  return null;
end;
$$;

drop trigger if exists trg_reel_like_count on ariana_reel_likes;
create trigger trg_reel_like_count
after insert or delete on ariana_reel_likes
for each row execute function ariana_reel_like_count_sync();

create table if not exists ariana_reel_comments (
  id uuid primary key default gen_random_uuid(),
  reel_id uuid not null references ariana_reels(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  comment text not null,
  created_at timestamptz not null default now()
);

alter table ariana_reel_comments enable row level security;

drop policy if exists "Public can read reel comments" on ariana_reel_comments;
create policy "Public can read reel comments"
  on ariana_reel_comments for select
  using (true);

drop policy if exists "Signed-in users can post reel comments" on ariana_reel_comments;
create policy "Signed-in users can post reel comments"
  on ariana_reel_comments for insert
  with check (auth.uid() = user_id);

create index if not exists idx_ariana_reel_comments_reel on ariana_reel_comments(reel_id, created_at);

-- Extend the shared contact-messages inbox (from the Aria concierge
-- migration) with a "reel_send" source and an optional reel reference,
-- instead of building a separate inbox just for reels.
alter table ariana_contact_messages drop constraint if exists ariana_contact_messages_source_check;
alter table ariana_contact_messages
  add constraint ariana_contact_messages_source_check
  check (source in ('contact_page', 'ai_complaint', 'ai_handoff', 'reel_send'));

alter table ariana_contact_messages
  add column if not exists reel_id uuid references ariana_reels(id) on delete set null;
