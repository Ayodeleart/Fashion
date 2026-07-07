-- AI concierge: reuses the existing ariana_contact_messages table/API for
-- complaint + "talk to a human" handoff instead of a parallel inbox, so
-- admin has ONE place to check messages. This just tags where each
-- message came from. Run in Supabase Dashboard -> SQL Editor.

alter table ariana_contact_messages
  add column if not exists source text not null default 'contact_page'
  check (source in ('contact_page', 'ai_complaint', 'ai_handoff'));

create index if not exists idx_ariana_contact_messages_source on ariana_contact_messages(source);
