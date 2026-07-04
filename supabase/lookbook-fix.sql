-- Adds the Lookbook panel upload feature (admin -> /admin/lookbook).
-- Run in Supabase Dashboard -> SQL Editor.

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
