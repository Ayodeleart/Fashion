-- Fixes "Bucket not found" on the Hero Looks admin page.
-- Run this in Supabase Dashboard -> SQL Editor (against the same
-- "Petty petty project" instance schema.sql targets).

-- 1. The storage bucket the upload code expects but that was never created.
insert into storage.buckets (id, name, public)
values ('hero-looks', 'hero-looks', true)
on conflict (id) do nothing;

-- 2. The table the workflow inserts into — also never existed in schema.sql
--    (only ariana_hero_videos was defined there).
create table if not exists ariana_hero_looks (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_left_url text,
  image_middle_url text not null,
  image_right_url text,
  bg_color text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table ariana_hero_looks enable row level security;

drop policy if exists "Public can read published hero looks" on ariana_hero_looks;
create policy "Public can read published hero looks"
  on ariana_hero_looks for select
  using (status = 'published');

-- No insert/update policy is added on purpose: writes now go through the
-- server action (hero-actions.ts) using the service-role client, which
-- bypasses RLS. That also means the "hero-looks" bucket doesn't need an
-- anon write policy — only "public" (for reads via getPublicUrl) is set.
