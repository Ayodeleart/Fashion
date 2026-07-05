-- Cart and saved/wishlist items, tied to the signed-in Supabase Auth user
-- (auth.uid()) instead of browser localStorage. No row exists for a guest
-- who hasn't signed in — that's intentional; the storefront now requires
-- a session before anything can be added to a cart or saved.

create table if not exists ariana_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null,
  name text not null,
  price numeric not null,
  currency text not null default 'NGN',
  image text,
  quantity int not null default 1 check (quantity > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table ariana_cart_items enable row level security;

drop policy if exists "Users manage own cart" on ariana_cart_items;
create policy "Users manage own cart"
  on ariana_cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_ariana_cart_items_user on ariana_cart_items(user_id);

create table if not exists ariana_saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null,
  name text not null,
  price numeric not null,
  currency text not null default 'NGN',
  image text,
  href text,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

alter table ariana_saved_items enable row level security;

drop policy if exists "Users manage own saved items" on ariana_saved_items;
create policy "Users manage own saved items"
  on ariana_saved_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_ariana_saved_items_user on ariana_saved_items(user_id);
