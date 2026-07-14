-- Run this in Supabase SQL editor.
-- Adds columns to the EXISTING ariana_lookbook_panels table only.
-- No new tables. Existing rows (label, image_url, href) are untouched.

alter table ariana_lookbook_panels
  add column if not exists designer_name text,
  add column if not exists location text,
  add column if not exists badge text check (badge in ('ready-made', 'bespoke', 'ready+bespoke')),
  add column if not exists fabric text,
  add column if not exists occasion text,
  add column if not exists description text,

  -- Filter row on Home (Wedding, Aso Oke, Celebrity, etc). A panel can
  -- carry more than one tag, e.g. {"wedding","bridal"}.
  add column if not exists style_tags text[] default '{}',

  -- Controls which feed layout this look renders as. Admin can pin a
  -- specific look to "dramatic" or "full" for emphasis; anything left
  -- null falls back to the auto rhythm in HomeFeed.tsx.
  add column if not exists feed_layout text check (feed_layout in ('full', 'portrait', 'masonry', 'dramatic', 'collage')),

  -- Editorial section dividers ("Wedding Collection", "Luxury Collection")
  -- are rows in this same table, flagged like this, rather than a
  -- separate table.
  add column if not exists is_editorial_break boolean default false,
  add column if not exists editorial_label text,

  -- Optional link from a look to an actual shoppable product. Nullable —
  -- most looks stay pure editorial (Make Bespoke / Enquire only). When
  -- set, the detail page can show a "Shop Product" action.
  add column if not exists linked_product_id uuid references ariana_products(id),

  -- Extra photos for the detail page (large image first, then these).
  add column if not exists gallery_images text[] default '{}';

-- Helpful for "More From This Designer" and filter lookups.
create index if not exists idx_lookbook_designer on ariana_lookbook_panels (designer_name);
create index if not exists idx_lookbook_style_tags on ariana_lookbook_panels using gin (style_tags);
