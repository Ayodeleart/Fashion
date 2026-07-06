-- Replaces the cutout+wordmark hero with simple full-banner uploads
-- (desktop image + mobile image, brand name baked into the artwork).
-- Run in Supabase Dashboard -> SQL Editor.

insert into storage.buckets (id, name, public)
values ('hero-banners', 'hero-banners', true)
on conflict (id) do nothing;

create table if not exists ariana_hero_banners (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  image_desktop_url text not null,
  image_mobile_url text not null,
  href text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table ariana_hero_banners enable row level security;

drop policy if exists "Public can read published hero banners" on ariana_hero_banners;
create policy "Public can read published hero banners"
  on ariana_hero_banners for select
  using (status = 'published');

-- The old ariana_hero_looks table/hero-looks bucket are no longer used
-- by the app but are left in place — nothing references them anymore,
-- safe to drop later if you want to tidy up:
--   drop table if exists ariana_hero_looks;
