-- Extends the existing contact-messages inbox to also carry Appointment and
-- Enquiry submissions, instead of forking into separate tables — the admin
-- inbox at /admin/messages stays one unified place to read every message
-- type. Run in Supabase Dashboard -> SQL Editor.

alter table ariana_contact_messages
  add column if not exists phone text,
  add column if not exists service_type text,
  add column if not exists preferred_date date,
  add column if not exists preferred_time text,
  add column if not exists look_id uuid references ariana_lookbook_panels(id) on delete set null,
  add column if not exists product_id uuid references ariana_products(id) on delete set null;

-- source has a real CHECK constraint (see reels-social-fix.sql) — extend it
-- rather than leaving "appointment"/"enquiry" as an app-layer-only allowlist.
alter table ariana_contact_messages drop constraint if exists ariana_contact_messages_source_check;
alter table ariana_contact_messages
  add constraint ariana_contact_messages_source_check
  check (source in ('contact_page', 'ai_complaint', 'ai_handoff', 'reel_send', 'appointment', 'enquiry'));

create index if not exists ariana_contact_messages_created_at_idx on ariana_contact_messages (created_at desc);
