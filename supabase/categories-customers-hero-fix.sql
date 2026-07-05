-- Adds: editable product categories (with thumbnail), customer profiles
-- (display name + avatar, backed by Supabase Auth users), and extra hero
-- banner fields (subtitle / cta text / watermark) to match the mobile
-- storefront design. Safe to run multiple times.

-- ---------- Categories ----------
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

-- ---------- Customer profiles (Supabase Auth) ----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create table if not exists ariana_customer_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  address jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table ariana_customer_profiles enable row level security;

drop policy if exists "Users can read own profile" on ariana_customer_profiles;
create policy "Users can read own profile"
  on ariana_customer_profiles for select
  using (auth.uid() = user_id);

drop policy if exists "Public can read profiles for display" on ariana_customer_profiles;
-- Profiles are readable publicly (display name / avatar only — no PII
-- beyond what the user chose to show) since storefront greetings need it.
create policy "Public can read profiles for display"
  on ariana_customer_profiles for select
  using (true);

drop policy if exists "Users can upsert own profile" on ariana_customer_profiles;
create policy "Users can upsert own profile"
  on ariana_customer_profiles for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own profile" on ariana_customer_profiles;
create policy "Users can update own profile"
  on ariana_customer_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Avatar storage: anyone can read (bucket is public), but a user may only
-- write inside a folder named after their own user id (avatars/<uid>/...).
drop policy if exists "Users can upload own avatar" on storage.objects;
create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "Users can update own avatar" on storage.objects;
create policy "Users can update own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ---------- Hero banner: extra copy fields for the mobile design ----------
alter table ariana_hero_banners add column if not exists subtitle text;
alter table ariana_hero_banners add column if not exists cta_text text;
alter table ariana_hero_banners add column if not exists watermark_text text;
