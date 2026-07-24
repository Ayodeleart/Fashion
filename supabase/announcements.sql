create table if not exists ariana_announcements (
  id uuid primary key default gen_random_uuid(),
  message text not null,
  position int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now()
);

alter table ariana_announcements enable row level security;

drop policy if exists "Public can read enabled announcements" on ariana_announcements;
create policy "Public can read enabled announcements"
  on ariana_announcements for select
  using (enabled = true);

create index if not exists idx_ariana_announcements_position on ariana_announcements(position);

-- Seed with the messages that were previously hardcoded, so nothing
-- visually changes until the admin edits them.
insert into ariana_announcements (message, position)
select * from (values
  ('New Luxury Collection Available', 0),
  ('AI Measurement Now Available', 1),
  ('Free Consultation For Bespoke Orders', 2),
  ('Wedding Season Collection', 3),
  ('New Celebrity Looks', 4)
) as seed(message, position)
where not exists (select 1 from ariana_announcements);
