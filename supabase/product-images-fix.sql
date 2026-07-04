-- Adds the storage bucket for product images.
-- The ariana_product_images table already exists (see schema.sql) —
-- this was the missing piece: nowhere to actually upload files to.
-- Run in Supabase Dashboard -> SQL Editor.

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;
