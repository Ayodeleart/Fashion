-- Ariana fashion e-commerce schema
-- Run against the "Petty petty project" Supabase instance.
-- Tables are prefixed ariana_ to coexist safely with unrelated apps
-- already sharing this project (goat_face, subtle_soul, etc). RLS is
-- enabled ONLY on these new tables — the project's existing products/
-- orders/banners/store_settings tables are left untouched.

create extension if not exists "pgcrypto";

-- ---------- Products ----------
create table if not exists ariana_products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  price numeric(10, 2) not null,
  currency text not null default 'USD',
  category text,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ariana_product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references ariana_products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  alt text
);

create table if not exists ariana_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references ariana_products(id) on delete cascade,
  size text not null,
  color text,
  stock int not null default 0,
  sku text unique
);

-- ---------- Hero video workflow ----------
-- Mirrors: Upload video -> generate mobile crop -> extract dominant color -> publish
create table if not exists ariana_hero_videos (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  desktop_url text not null,
  mobile_url text,                 -- filled in once the mobile crop step runs
  dominant_color text,             -- "r, g, b" string, filled in by the color-extraction step
  position int not null default 0, -- order in the hero rotation
  status text not null default 'draft' check (status in ('draft', 'processing', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Hero banners (full designed image, brand baked in) ----------
-- Superseded the old cutout+wordmark "hero looks" system, which is no
-- longer referenced anywhere in the app. That table/bucket
-- (ariana_hero_looks / hero-looks) are safe to drop if you want to
-- tidy up later:
--   drop table if exists ariana_hero_looks;
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

create policy "Public can read published hero banners"
  on ariana_hero_banners for select
  using (status = 'published');

-- ---------- Lookbook panels ----------
insert into storage.buckets (id, name, public)
values ('lookbook', 'lookbook', true)
on conflict (id) do nothing;

create table if not exists ariana_lookbook_panels (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  href text not null default '#',
  image_url text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);

alter table ariana_lookbook_panels enable row level security;

create policy "Public can read lookbook panels"
  on ariana_lookbook_panels for select
  using (true);

-- ---------- Product images bucket ----------
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- ---------- Orders / cart ----------
create table if not exists ariana_orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  payment_provider text check (payment_provider in ('paystack', 'stripe')),
  total numeric(10, 2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists ariana_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references ariana_orders(id) on delete cascade,
  product_id uuid references ariana_products(id) on delete set null,
  variant_id uuid references ariana_product_variants(id) on delete set null,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null
);

-- ---------- Row Level Security (this project's new tables only) ----------
alter table ariana_products enable row level security;
alter table ariana_product_images enable row level security;
alter table ariana_product_variants enable row level security;
alter table ariana_hero_videos enable row level security;
alter table ariana_orders enable row level security;
alter table ariana_order_items enable row level security;

-- Public (anon) read access to published storefront content only.
create policy "Public can read published products"
  on ariana_products for select
  using (is_published = true);

create policy "Public can read product images of published products"
  on ariana_product_images for select
  using (exists (
    select 1 from ariana_products p where p.id = ariana_product_images.product_id and p.is_published = true
  ));

create policy "Public can read variants of published products"
  on ariana_product_variants for select
  using (exists (
    select 1 from ariana_products p where p.id = ariana_product_variants.product_id and p.is_published = true
  ));

create policy "Public can read published hero videos"
  on ariana_hero_videos for select
  using (status = 'published');

-- Orders/order_items: no public select policy — only the service role
-- (used from the admin app / server actions) can read or write these.

create index if not exists idx_ariana_product_images_product_id on ariana_product_images(product_id);
create index if not exists idx_ariana_product_variants_product_id on ariana_product_variants(product_id);
create index if not exists idx_ariana_order_items_order_id on ariana_order_items(order_id);
create index if not exists idx_ariana_hero_videos_position on ariana_hero_videos(position);
