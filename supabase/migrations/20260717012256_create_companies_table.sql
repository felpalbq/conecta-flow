create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  timezone text not null default 'America/Sao_Paulo',
  locale text not null default 'pt-BR',
  plan text not null default 'trial' check (plan in ('trial', 'starter', 'pro', 'enterprise')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index companies_slug_idx on public.companies (slug) where deleted_at is null;
create index companies_status_idx on public.companies (status);

create trigger set_updated_at
  before update on public.companies
  for each row
  execute function public.set_updated_at();

-- RLS enabled immediately; zero policies means fully denied until
-- create_rls_policies.sql adds companies_select/companies_update (deferred
-- because they depend on authorization helper functions created after every
-- table exists — see create_authorization_functions.sql).
alter table public.companies enable row level security;

-- No insert/delete policy for `authenticated` ever: company creation is
-- "somente administrador ou fluxo autorizado" (multi-tenancy.md), done
-- server-side with the service-role key.
grant select, update on public.companies to authenticated;
