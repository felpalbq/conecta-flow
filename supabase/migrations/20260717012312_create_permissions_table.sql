-- Global catalog (docs/02-architecture/permission-model.md). Reference data —
-- inserted here, not in supabase/seed/, because it is not fictitious dev data.
create table public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text not null unique,
  description text not null,
  scope text not null default 'company' check (scope in ('company', 'platform')),
  created_at timestamptz not null default now()
);

alter table public.permissions enable row level security;

-- Every authenticated user may read the catalog (needed to render permission
-- names in the UI). No mutation policy: managed only via migrations.
create policy permissions_select on public.permissions
  for select
  using (true);

grant select on public.permissions to authenticated;

insert into public.permissions (key, description, scope) values
  ('user.manage', 'Gerenciar usuários e memberships da própria empresa', 'company'),
  ('dashboard.read', 'Visualizar indicadores da empresa', 'company'),
  ('audit.read', 'Consultar registros de auditoria da própria empresa', 'company'),
  ('platform.company.manage', 'Gerenciar empresas e tenants da plataforma', 'platform'),
  ('platform.user.manage', 'Administrar usuários da plataforma', 'platform'),
  ('platform.audit.read', 'Consultar auditoria global da plataforma', 'platform');
