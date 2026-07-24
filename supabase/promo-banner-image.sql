alter table ariana_promo_banner add column if not exists image_url text;

insert into storage.buckets (id, name, public)
values ('promo-banner', 'promo-banner', true)
on conflict (id) do nothing;
