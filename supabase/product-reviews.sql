-- Product reviews: powers the "Reviews" section on the product page
-- (rating summary, fit distribution, individual reviews) and the
-- "See all N reviews" sheet.
--
-- Run this once in the Supabase SQL editor.

create table if not exists ariana_product_reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references ariana_products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  fit_feedback text check (fit_feedback in ('small', 'true_to_size', 'large')),
  title text,
  body text,
  author_name text not null default 'Anonymous',
  helpful_count int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists ariana_product_reviews_product_id_idx
  on ariana_product_reviews (product_id, created_at desc);

alter table ariana_product_reviews enable row level security;

-- Anyone (including anonymous shop visitors) can read reviews.
drop policy if exists "Public can read reviews" on ariana_product_reviews;
create policy "Public can read reviews"
  on ariana_product_reviews for select
  using (true);

-- Only signed-in users can post a review, and only attributed to themselves.
drop policy if exists "Signed-in users can write their own review" on ariana_product_reviews;
create policy "Signed-in users can write their own review"
  on ariana_product_reviews for insert
  with check (auth.uid() = user_id);

-- A reviewer can update/delete only their own review.
drop policy if exists "Users manage their own review" on ariana_product_reviews;
create policy "Users manage their own review"
  on ariana_product_reviews for update
  using (auth.uid() = user_id);

drop policy if exists "Users delete their own review" on ariana_product_reviews;
create policy "Users delete their own review"
  on ariana_product_reviews for delete
  using (auth.uid() = user_id);

-- Lets any signed-in visitor bump "Helpful (N)" on someone else's review
-- without letting them touch rating/title/body — a plain UPDATE policy
-- can't scope to a single column, so this does it via a SECURITY DEFINER
-- function instead, called from the client as
-- supabase.rpc('mark_review_helpful', { review_id }).
create or replace function mark_review_helpful(review_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update ariana_product_reviews
  set helpful_count = helpful_count + 1
  where id = review_id;
$$;
