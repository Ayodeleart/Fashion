-- Dedicated hero for the mobile shop's HeroCard (previously it was
-- reusing ariana_hero_banners, which also feeds the *editorial* site's
-- mobile hero carousel — same device='mobile' rows were showing in both
-- places). This gives the shop its own admin-managed hero, independent
-- of the editorial homepage.

insert into storage.buckets (id, name, public)
values ('shop-hero', 'shop-hero', true)
on conflict (id) do nothing;

create table if not exists ariana_shop_hero (
  id uuid primary key default gen_random_uuid(),
  label text,
  image_url text not null,
  href text,
  position int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table ariana_shop_hero enable row level security;

drop policy if exists "Public can read published shop hero" on ariana_shop_hero;
create policy "Public can read published shop hero"
  on ariana_shop_hero for select
  using (status = 'published');

-- Reels/video feed for the shop's new video tab.

insert into storage.buckets (id, name, public)
values ('reels', 'reels', true)
on conflict (id) do nothing;

create table if not exists ariana_reels (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  thumbnail_url text,
  caption text,
  product_id uuid references ariana_products(id) on delete set null,
  position int not null default 0,
  status text not null default 'published' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);

alter table ariana_reels enable row level security;

drop policy if exists "Public can read published reels" on ariana_reels;
create policy "Public can read published reels"
  on ariana_reels for select
  using (status = 'published');

create index if not exists idx_ariana_reels_position on ariana_reels(position);
