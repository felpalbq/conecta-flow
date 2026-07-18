-- Audit finding A4: `shares_active_company_with` misnamed — it checks whether
-- two profiles share ANY active membership, not the caller's "active company"
-- (a session concept tracked client-side via cookie, not in the database).
-- Renaming to `shares_company_with` to avoid a future policy relying on the
-- wrong semantics.
create function public.shares_company_with(target_profile_id uuid)
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

grant execute on function public.shares_company_with(uuid) to authenticated;

drop policy profiles_select on public.profiles;

create policy profiles_select on public.profiles
  for select
  using (
    id = auth.uid()
    or public.is_platform_admin()
    or public.shares_company_with(id)
  );

drop function public.shares_active_company_with(uuid);
