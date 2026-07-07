-- Reels get grouped into your existing shop categories (Aso oke, Agbada
-- gbajumo, etc.) so the reels tab can show a tap-in grid, then swipe
-- within just that category — rather than every reel in one long feed.

alter table ariana_reels
  add column if not exists category_id uuid references ariana_categories(id) on delete set null;

create index if not exists idx_ariana_reels_category on ariana_reels(category_id);
