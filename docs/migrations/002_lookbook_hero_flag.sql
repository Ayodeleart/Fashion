-- Run this too — one more column on the same table.
-- Lets you flag which look is the Home hero, fully separate from the
-- landing page's hero banners table.
alter table ariana_lookbook_panels
  add column if not exists is_hero boolean default false;

-- Only one look should ever be the hero at a time.
create unique index if not exists idx_lookbook_single_hero
  on ariana_lookbook_panels (is_hero)
  where is_hero = true;
