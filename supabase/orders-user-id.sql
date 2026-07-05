alter table ariana_orders add column if not exists user_id uuid references auth.users(id);

create index if not exists idx_ariana_orders_user_id on ariana_orders(user_id);

drop policy if exists "Users can read own orders" on ariana_orders;
create policy "Users can read own orders"
  on ariana_orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can read own order items" on ariana_order_items;
create policy "Users can read own order items"
  on ariana_order_items for select
  using (exists (
    select 1 from ariana_orders o where o.id = ariana_order_items.order_id and o.user_id = auth.uid()
  ));
