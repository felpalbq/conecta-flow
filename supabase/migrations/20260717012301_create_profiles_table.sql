-- Mirror of auth.users (ADR-001: auth.users -> profiles -> company_memberships -> companies).
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  email text not null,
  avatar_url text,
  status text not null default 'active' check (status in ('active', 'inactive', 'suspended')),
  last_login timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Every auth.users row must have a profile regardless of how it was created
-- (self-signup, admin.createUser in seed/invite flows, dashboard) — a trigger
-- guarantees this invariant unconditionally, security definer bypasses RLS.
create function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', new.email), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;

-- Self-contained (no cross-table helper needed): a profile can always update
-- itself. profiles_select (self + teammates + platform admins) is deferred to
-- create_rls_policies.sql — it depends on shares_company_with(), which
-- depends on company_memberships. No insert/delete policy: creation is
-- exclusively via the auth.users trigger above.
create policy profiles_update on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

grant select, update on public.profiles to authenticated;
