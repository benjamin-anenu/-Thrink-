
-- 1) Helper functions (SECURITY DEFINER, safe search_path)
create or replace function public.is_system_owner(_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and coalesce(is_system_owner, false) = true
  );
$$;

create or replace function public.user_in_enterprise(_enterprise_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where enterprise_id = _enterprise_id
      and user_id = _user_id
  );
$$;

create or replace function public.user_in_workspace(_workspace_id uuid, _user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = _workspace_id
      and user_id = _user_id
      and status = 'active'
  );
$$;

-- 2) Reset RLS on user_roles (avoid any recursion)
alter table public.user_roles enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'user_roles'
  loop
    execute format('drop policy %I on public.user_roles', pol.policyname);
  end loop;
end $$;

create policy "Users can view their own user_roles"
on public.user_roles
for select
using (user_id = auth.uid());

-- (Intentionally no insert/update/delete policies to avoid recursion pathways.
--  Admin changes happen via privileged migrations or admin-only RPCs.)

-- 3) Reset RLS on enterprises using safe helpers
alter table public.enterprises enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'enterprises'
  loop
    execute format('drop policy %I on public.enterprises', pol.policyname);
  end loop;
end $$;

create policy "Enterprise owner can manage enterprise"
on public.enterprises
for all
using (owner_id = auth.uid())
with check (owner_id = auth.uid());

create policy "Enterprise members can view enterprise"
on public.enterprises
for select
using (owner_id = auth.uid() or public.user_in_enterprise(id, auth.uid()));

-- 4) Reset RLS on workspaces using safe helpers
alter table public.workspaces enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'workspaces'
  loop
    execute format('drop policy %I on public.workspaces', pol.policyname);
  end loop;
end $$;

create policy "Workspace members can view workspaces"
on public.workspaces
for select
using (
  owner_id = auth.uid()
  or public.user_in_workspace(id, auth.uid())
  or public.user_in_enterprise(enterprise_id, auth.uid())
);

create policy "Workspace owners/admins can manage workspaces"
on public.workspaces
for all
using (
  owner_id = auth.uid()
  or public.is_workspace_admin(id, auth.uid())
)
with check (
  owner_id = auth.uid()
  or public.is_workspace_admin(id, auth.uid())
);

-- 5) Reset RLS on workspace_members (keep simple; avoid cycles)
alter table public.workspace_members enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'workspace_members'
  loop
    execute format('drop policy %I on public.workspace_members', pol.policyname);
  end loop;
end $$;

create policy "Users can view their own workspace memberships"
on public.workspace_members
for select
using (user_id = auth.uid());

create policy "Users can leave workspaces (delete own membership)"
on public.workspace_members
for delete
using (user_id = auth.uid());

-- (Inserts/updates handled by SECURITY DEFINER RPCs like invite/accept; no policy here to avoid recursion)

-- 6) Backfill: ensure every workspace owner is also a member with role 'owner'
insert into public.workspace_members (workspace_id, user_id, role, status)
select w.id, w.owner_id, 'owner'::text, 'active'::text
from public.workspaces w
where not exists (
  select 1
  from public.workspace_members wm
  where wm.workspace_id = w.id
    and wm.user_id = w.owner_id
);
