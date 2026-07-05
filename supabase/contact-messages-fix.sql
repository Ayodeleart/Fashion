-- Contact page submissions. Run in Supabase Dashboard -> SQL Editor.

create table if not exists ariana_contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table ariana_contact_messages enable row level security;

-- No public select policy: only the service-role (admin) client reads
-- these, not the public anon client. Public can only insert.
drop policy if exists "Anyone can submit a contact message" on ariana_contact_messages;
create policy "Anyone can submit a contact message"
  on ariana_contact_messages for insert
  with check (true);
