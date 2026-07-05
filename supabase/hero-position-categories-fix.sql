-- Safe to run multiple times (all ADD COLUMN IF NOT EXISTS / idempotent).
-- Run in Supabase Dashboard -> SQL Editor.

-- The device-split redesign (separate desktop/mobile banner rows) was
-- shipped in code but its migration was never saved to a file — this
-- catches it up, plus adds position (manual ordering / "set as
-- default") and the overlay text fields used by the hero tagline/CTA.
alter table ariana_hero_banners add column if not exists device text not null default 'desktop';
alter table ariana_hero_banners add column if not exists image_url text;
alter table ariana_hero_banners add column if not exists position int not null default 0;
alter table ariana_hero_banners add column if not exists subtitle text;
alter table ariana_hero_banners add column if not exists cta_text text;
alter table ariana_hero_banners add column if not exists cta_href text;

-- (No backfill needed — image_desktop_url/image_mobile_url never
-- existed on the live table; this table was already device-based.)

create index if not exists idx_ariana_hero_banners_position on ariana_hero_banners(position);

-- ---------- Categories (the "related resource does not exist" fix) ----------
insert into storage.buckets (id, name, public)
values ('category-thumbnails', 'category-thumbnails', true)
on conflict (id) do nothing;

create table if not exists ariana_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  thumbnail_url text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table ariana_categories enable row level security;

drop policy if exists "Public can read categories" on ariana_categories;
create policy "Public can read categories"
  on ariana_categories for select
  using (true);

create index if not exists idx_ariana_categories_position on ariana_categories(position);
