-- Policies deferred from each table's own migration because they depend on
-- the authorization helper functions in create_authorization_functions.sql.

-- companies: members of a company (any role) and platform admins can read;
-- only an active Owner membership may update (Configurações da empresa).
create policy companies_select on public.companies
  for select
  using (public.is_member_of_company(id) or public.is_platform_admin());

create policy companies_update on public.companies
  for update
  using (public.is_active_owner_of_company(id))
  with check (public.is_active_owner_of_company(id));

-- profiles: self (already covered by profiles_update), teammates sharing any
-- active company (needed by the team/switcher UI), and platform admins.
create policy profiles_select on public.profiles
  for select
  using (
    id = auth.uid()
    or public.is_platform_admin()
    or public.shares_active_company_with(id)
  );

-- company_memberships: self, peers in the same company, and platform admins.
create policy company_memberships_select on public.company_memberships
  for select
  using (
    profile_id = auth.uid()
    or public.is_member_of_company(company_id)
    or public.is_platform_admin()
  );

-- admin_users: self or other platform admins.
create policy admin_users_select on public.admin_users
  for select
  using (profile_id = auth.uid() or public.is_platform_admin());

-- audit_logs: scoped to company members or platform admins.
create policy audit_logs_select on public.audit_logs
  for select
  using (public.is_member_of_company(company_id) or public.is_platform_admin());
