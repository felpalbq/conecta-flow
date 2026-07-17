-- Immutable audit trail (security-model.md). Never updated or deleted.
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  company_id uuid references public.companies (id),
  action text not null,
  entity text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index audit_logs_company_idx on public.audit_logs (company_id);
create index audit_logs_actor_idx on public.audit_logs (actor_id);
create index audit_logs_action_idx on public.audit_logs (action);

alter table public.audit_logs enable row level security;

-- Self-contained: the app always writes as the acting user. audit_logs_select
-- is deferred to create_rls_policies.sql (needs is_member_of_company() /
-- is_platform_admin()).
create policy audit_logs_insert on public.audit_logs
  for insert
  with check (actor_id = auth.uid());

-- Belt-and-suspenders immutability: revoked at the grant level, not just
-- policy level (no update/delete policy exists either).
grant select, insert on public.audit_logs to authenticated;
revoke update, delete on public.audit_logs from authenticated, anon;
