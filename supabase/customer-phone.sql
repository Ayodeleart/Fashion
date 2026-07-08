alter table ariana_customer_profiles add column if not exists phone text;

notify pgrst, 'reload schema';
