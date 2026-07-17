-- Authorization helper functions used by RLS policies (create_rls_policies.sql).
-- Placed after every table they reference, because `language sql` function
-- bodies ARE parsed and validated against the catalog at CREATE FUNCTION
-- time (unlike plpgsql, which only stores the body as text).
--
-- `security definer` is essential, not cosmetic: it runs each lookup as the
-- function owner, bypassing RLS on company_memberships/admin_users
-- themselves — this avoids self-referential RLS recursion when those same
-- tables' own policies call these functions, and keeps each check a single
-- indexed lookup instead of a correlated subquery re-evaluated per row.
--
-- Semantic note: these functions answer "does the user belong to *some*
-- membership for this company_id / is *some* platform admin" — not "is this
-- the user's currently active company." Active-company selection is an
-- application-layer concept (core/tenancy); the app always adds
-- `.eq('company_id', activeCompanyId)` on top — RLS is defense-in-depth
-- confirming that filter was legitimate, not a substitute for it.

create function public.is_member_of_company(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.company_memberships m
    where m.company_id = target_company_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
  );
$$;

grant execute on function public.is_member_of_company(uuid) to authenticated;

create function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users a
    where a.profile_id = auth.uid()
      and a.status = 'active'
  );
$$;

grant execute on function public.is_platform_admin() to authenticated;

create function public.is_active_owner_of_company(target_company_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.company_memberships m
    where m.company_id = target_company_id
      and m.profile_id = auth.uid()
      and m.status = 'active'
      and m.role = 'owner'
  );
$$;

grant execute on function public.is_active_owner_of_company(uuid) to authenticated;

create function public.shares_active_company_with(target_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.company_memberships mine
    join public.company_memberships theirs on theirs.company_id = mine.company_id
    where mine.profile_id = auth.uid()
      and mine.status = 'active'
      and theirs.profile_id = target_profile_id
      and theirs.status = 'active'
  );
$$;

grant execute on function public.shares_active_company_with(uuid) to authenticated;
