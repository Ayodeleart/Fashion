create table if not exists ariana_promo_banner (
  id int primary key default 1,
  enabled boolean not null default false,
  title text not null default '',
  message text not null default '',
  cta_text text not null default 'Shop now',
  cta_href text not null default '/catalog',
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

insert into ariana_promo_banner (id) values (1) on conflict (id) do nothing;

alter table ariana_promo_banner enable row level security;

drop policy if exists "Public can read promo banner" on ariana_promo_banner;
create policy "Public can read promo banner"
  on ariana_promo_banner for select
  using (true);
