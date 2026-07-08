alter table ariana_cart_items add column if not exists variant_id uuid references ariana_product_variants(id) on delete set null;
alter table ariana_cart_items add column if not exists size text;

-- Replace the old (user_id, product_id) uniqueness with variant-aware
-- uniqueness: same product + different size = different cart line. Two
-- partial indexes since a plain unique(user_id, product_id, variant_id)
-- would let a NULL variant_id repeat (NULLs never equal each other in a
-- uniqueness check), which would break "add same no-size product twice
-- just bumps quantity" for products with no variants.
alter table ariana_cart_items drop constraint if exists ariana_cart_items_user_id_product_id_key;

create unique index if not exists idx_cart_items_with_variant
  on ariana_cart_items (user_id, product_id, variant_id)
  where variant_id is not null;

create unique index if not exists idx_cart_items_without_variant
  on ariana_cart_items (user_id, product_id)
  where variant_id is null;

notify pgrst, 'reload schema';
