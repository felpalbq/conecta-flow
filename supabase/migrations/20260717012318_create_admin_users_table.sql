-- Platform administrators (Mission Control, ADR-011) — identity separate from
-- company users. An admin may have zero company_memberships.
create table public.admin_users (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null unique references public.profiles (id) on delete cascade,
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.admin_users
  for each row
  execute function public.set_updated_at();

-- RLS enabled immediately; admin_users_select is deferred to
-- create_rls_policies.sql (needs is_platform_admin(), which itself queries
-- this table as security definer — defined after this table exists to keep
-- that self-reference well-formed). No mutation policy ever: admin promotion
-- is a trusted, out-of-band server operation, never client-writable.
alter table public.admin_users enable row level security;

grant select on public.admin_users to authenticated;
