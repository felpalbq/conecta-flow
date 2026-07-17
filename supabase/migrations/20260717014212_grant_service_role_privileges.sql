-- service_role bypasses RLS (BYPASSRLS) but still needs table-level grants —
-- those are independent of RLS. Grant broadly here (trusted, server-only
-- role: seed script, and future invite/admin-promotion flows) and set
-- default privileges so tables created by later migrations don't need this
-- repeated.
grant usage on schema public to service_role;
grant all privileges on all tables in schema public to service_role;
grant all privileges on all sequences in schema public to service_role;
grant all privileges on all functions in schema public to service_role;

alter default privileges in schema public grant all privileges on tables to service_role;
alter default privileges in schema public grant all privileges on sequences to service_role;
alter default privileges in schema public grant all privileges on functions to service_role;
