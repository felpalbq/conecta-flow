-- Extensions used across the schema.
create extension if not exists "pgcrypto" with schema extensions;

-- Shared updated_at trigger, attached per-table by each subsequent migration.
-- (Authorization helper functions live in create_authorization_functions.sql,
-- after every table they reference exists — `language sql` function bodies
-- ARE validated against the catalog at creation time, unlike plpgsql.)
create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
