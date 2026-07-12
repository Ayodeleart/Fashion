-- Run this in the Supabase SQL editor before the new Home page will work.
-- Two additive, backward-compatible changes:

-- 1. ariana_lookbook_panels needs a chapter (category) and an optional
--    story shown when a customer taps a look on Home.
alter table ariana_lookbook_panels
  add column if not exists category text not null default 'seasonal',
  add column if not exists story text;

-- 2. ariana_saved_items needs to distinguish a saved style (no price, no
--    add-to-cart) from a saved product. Defaults existing rows to 'product'
--    so nothing already saved changes behavior.
alter table ariana_saved_items
  add column if not exists kind text not null default 'product';
