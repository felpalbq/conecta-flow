create table public.company_memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid not null references public.companies (id) on delete cascade,
  role text not null check (role in ('owner', 'attendant')),
  permissions jsonb not null default '[]'::jsonb,
  status text not null default 'active' check (status in ('active', 'invited', 'suspended')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, company_id)
);

create index company_memberships_profile_idx on public.company_memberships (profile_id);
create index company_memberships_company_idx on public.company_memberships (company_id);

create trigger set_updated_at
  before update on public.company_memberships
  for each row
  execute function public.set_updated_at();

-- RLS enabled immediately; company_memberships_select is deferred to
-- create_rls_policies.sql (needs is_member_of_company(), defined after this
-- table exists). No insert/update/delete policy for `authenticated` ever:
-- membership mutation (invites, role changes) always goes through a
-- server-side route handler using the service-role client, which enforces
-- the real business rule (only Owner may invite) before writing.
alter table public.company_memberships enable row level security;

grant select on public.company_memberships to authenticated;
