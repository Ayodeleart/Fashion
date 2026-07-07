-- Photo-estimated measurements, one row per signed-in customer. Values
-- are the AI's estimate as corrected by the customer's slider fine-tune —
-- we never store the raw uncorrected estimate, only what the customer
-- confirmed. Same auth.uid()-scoped pattern as cart/saved.

create table if not exists ariana_customer_measurements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  height_cm numeric(5,1) not null,
  shoulder_cm numeric(5,1),
  chest_cm numeric(5,1),
  waist_cm numeric(5,1),
  hip_cm numeric(5,1),
  arm_length_cm numeric(5,1),
  inseam_cm numeric(5,1),
  source text not null default 'photo_estimate' check (source in ('photo_estimate', 'manual')),
  updated_at timestamptz not null default now()
);

alter table ariana_customer_measurements enable row level security;

drop policy if exists "Users manage own measurements" on ariana_customer_measurements;
create policy "Users manage own measurements"
  on ariana_customer_measurements for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
