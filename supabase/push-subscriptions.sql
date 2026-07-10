create table if not exists ariana_push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,
  created_at timestamptz not null default now()
);

alter table ariana_push_subscriptions enable row level security;

-- Subscribing/unsubscribing happens from the client with the publishable
-- key — anyone (including a not-yet-signed-in visitor, since push
-- permission can be granted before login) can register a subscription
-- for themselves, and only touch their own endpoint.
drop policy if exists "Anyone can create a push subscription" on ariana_push_subscriptions;
create policy "Anyone can create a push subscription"
  on ariana_push_subscriptions for insert
  with check (true);

drop policy if exists "Anyone can remove their own subscription by endpoint" on ariana_push_subscriptions;
create policy "Anyone can remove their own subscription by endpoint"
  on ariana_push_subscriptions for delete
  using (true);

create index if not exists idx_ariana_push_subscriptions_user on ariana_push_subscriptions(user_id);
