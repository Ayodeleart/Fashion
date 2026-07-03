-- Ariana fashion e-commerce schema
-- Run against the "Petty petty project" Supabase instance.

create extension if not exists "pgcrypto";

-- ---------- Products ----------
create table if not exists products (
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

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  position int not null default 0,
  alt text
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text,
  stock int not null default 0,
  sku text unique
);

-- ---------- Hero video workflow ----------
-- Mirrors: Upload video -> generate mobile crop -> extract dominant color -> publish
create table if not exists hero_videos (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  desktop_url text not null,
  mobile_url text,                 -- filled in once the mobile crop step runs
  dominant_color text,             -- "r, g, b" string, filled in by the color-extraction step
  position int not null default 0, -- order in the hero rotation
  status text not null default 'draft' check (status in ('draft', 'processing', 'published')),
  created_at timestamptz not null default now()
);

-- ---------- Orders / cart ----------
create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_email text not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  total numeric(10, 2) not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  quantity int not null default 1,
  unit_price numeric(10, 2) not null
);

-- ---------- Row Level Security ----------
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table hero_videos enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Public (anon) read access to published storefront content only.
create policy "Public can read published products"
  on products for select
  using (is_published = true);

create policy "Public can read product images of published products"
  on product_images for select
  using (exists (
    select 1 from products p where p.id = product_images.product_id and p.is_published = true
  ));

create policy "Public can read variants of published products"
  on product_variants for select
  using (exists (
    select 1 from products p where p.id = product_variants.product_id and p.is_published = true
  ));

create policy "Public can read published hero videos"
  on hero_videos for select
  using (status = 'published');

-- Orders/order_items: no public select policy — only the service role
-- (used from the admin app / server actions) can read or write these.

create index if not exists idx_product_images_product_id on product_images(product_id);
create index if not exists idx_product_variants_product_id on product_variants(product_id);
create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_hero_videos_position on hero_videos(position);
