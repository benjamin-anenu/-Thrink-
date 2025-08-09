
-- 1) Extend workspace_members with temporary access fields
alter table public.workspace_members
  add column if not exists temporary boolean not null default false,
  add column if not exists expires_at timestamptz null;

-- 2) Update helper functions to respect expiry for temporary rows

create or replace function public.is_workspace_member(workspace_id_param uuid, user_id_param uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = workspace_id_param
      and user_id = user_id_param
      and status = 'active'
      and (temporary = false or coalesce(expires_at, now() + interval '100 years') > now())
  );
$$;

create or replace function public.is_workspace_admin(workspace_id_param uuid, user_id_param uuid)
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from public.workspace_members
    where workspace_id = workspace_id_param
      and user_id = user_id_param
      and role in ('owner', 'admin')
      and status = 'active'
      and (temporary = false or coalesce(expires_at, now() + interval '100 years') > now())
  );
$$;

-- Keep get_user_permissions_context current but exclude expired temporary rows from the membership payload
create or replace function public.get_user_permissions_context(_user_id uuid)
returns table(is_system_owner boolean, system_role app_role, admin_permissions jsonb, workspace_memberships jsonb)
language plpgsql
stable security definer
as $function$
begin
  return query
  select 
    coalesce(ur.is_system_owner, false) as is_system_owner,
    ur.role as system_role,
    coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'permission_type', permission_type,
          'permission_scope', permission_scope,
          'granted_by', granted_by
        )
      ) from public.admin_permissions 
       where user_id = _user_id and is_active = true), 
      '[]'::jsonb
    ) as admin_permissions,
    coalesce(
      (select jsonb_agg(
        jsonb_build_object(
          'workspace_id', workspace_id,
          'role', role,
          'status', status
        )
      ) from public.workspace_members 
       where user_id = _user_id 
         and status = 'active'
         and (temporary = false or coalesce(expires_at, now() + interval '100 years') > now())), 
      '[]'::jsonb
    ) as workspace_memberships
  from public.user_roles ur
  where ur.user_id = _user_id
  order by 
    case ur.role 
      when 'owner' then 1
      when 'admin' then 2
      when 'member' then 3
      when 'viewer' then 4
    end
  limit 1;
end;
$function$;

-- 3) RPC to assume temporary workspace access
create or replace function public.assume_workspace_access(
  _workspace_id uuid,
  _ttl_minutes integer default 240,
  _role text default 'admin'
)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  enterprise_id uuid;
  caller uuid := auth.uid();
  ttl interval := make_interval(mins => _ttl_minutes);
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  select enterprise_id into enterprise_id from public.workspaces where id = _workspace_id;
  if not found then
    raise exception 'Workspace not found';
  end if;

  -- privilege: caller must be system owner OR enterprise owner for this workspace’s enterprise
  if not (
    exists (select 1 from public.user_roles ur where ur.user_id = caller and ur.is_system_owner = true)
    or exists (select 1 from public.user_roles ur where ur.user_id = caller and ur.enterprise_id = enterprise_id and (ur.is_enterprise_owner = true or ur.role = 'owner'))
    or exists (select 1 from public.enterprises e where e.id = enterprise_id and e.owner_id = caller)
  ) then
    raise exception 'Insufficient privileges to assume access for this workspace';
  end if;

  insert into public.workspace_members (id, workspace_id, user_id, role, invited_by, joined_at, status, permissions, temporary, expires_at)
  values (gen_random_uuid(), _workspace_id, caller, coalesce(_role, 'admin'), caller, now(), 'active', '{}'::jsonb, true, now() + ttl)
  on conflict (workspace_id, user_id) do update
    set role = excluded.role,
        status = 'active',
        invited_by = caller,
        joined_at = coalesce(public.workspace_members.joined_at, now()),
        permissions = coalesce(public.workspace_members.permissions, '{}'::jsonb),
        temporary = true,
        expires_at = now() + ttl;

  insert into public.audit_logs (id, user_id, action, resource_type, resource_id, metadata, created_at)
  values (gen_random_uuid(), caller, 'assume_workspace_access', 'workspace', _workspace_id, jsonb_build_object('ttl_minutes', _ttl_minutes), now());

  return true;
end;
$$;

-- 4) RPC to clear temporary access
create or replace function public.clear_workspace_access(_workspace_id uuid)
returns boolean
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  caller uuid := auth.uid();
begin
  if caller is null then
    raise exception 'Not authenticated';
  end if;

  update public.workspace_members
  set status = 'inactive',
      temporary = false,
      expires_at = now()
  where workspace_id = _workspace_id
    and user_id = caller
    and temporary = true;

  insert into public.audit_logs (id, user_id, action, resource_type, resource_id, metadata, created_at)
  values (gen_random_uuid(), caller, 'clear_workspace_access', 'workspace', _workspace_id, null, now());

  return true;
end;
$$;

-- 5) Utility to inactivate any expired temporary memberships
create or replace function public.cleanup_expired_workspace_access()
returns integer
language plpgsql
security definer
set search_path = 'public'
as $$
declare
  cnt int;
begin
  update public.workspace_members
  set status = 'inactive',
      temporary = false
  where temporary = true
    and expires_at is not null
    and expires_at <= now();

  get diagnostics cnt = row_count;
  return cnt;
end;
$$;

-- 6) Allow authenticated clients to invoke the RPCs
grant execute on function public.assume_workspace_access(uuid, integer, text) to authenticated;
grant execute on function public.clear_workspace_access(uuid) to authenticated;
grant execute on function public.cleanup_expired_workspace_access() to authenticated;
