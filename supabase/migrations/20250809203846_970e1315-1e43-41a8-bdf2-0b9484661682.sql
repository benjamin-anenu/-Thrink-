-- Break RLS recursion for enterprises, user_roles, and workspaces
-- 1) Helper functions (SECURITY DEFINER, STABLE)

-- Ensure search_path is safe and consistent
CREATE OR REPLACE FUNCTION public.is_system_owner(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'owner'
  );
$$;

CREATE OR REPLACE FUNCTION public.user_in_enterprise(_enterprise_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE enterprise_id = _enterprise_id
      AND user_id = _user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.user_in_workspace(_workspace_id uuid, _user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = _workspace_id
      AND user_id = _user_id
      AND status = 'active'
  );
$$;

-- 2) Drop existing conflicting policies to prevent recursion
DO $$
DECLARE pol record;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('enterprises','user_roles','workspaces','workspace_members')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 3) Ensure RLS enabled
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- 4) Recreate safe, non-recursive policies
-- user_roles: allow users to view their own roles only (no joins)
CREATE POLICY "Users view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

-- enterprises: owners manage, members view via helper function
CREATE POLICY "Users can create enterprises they own"
ON public.enterprises
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their owned enterprises"
ON public.enterprises
FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Users can view enterprises they belong to"
ON public.enterprises
FOR SELECT
USING (
  owner_id = auth.uid() OR public.user_in_enterprise(id, auth.uid())
);

-- workspaces: visible to owner, members, or anyone in the same enterprise (via helper)
CREATE POLICY "Users can view workspaces they have access to"
ON public.workspaces
FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.user_in_workspace(id, auth.uid())
  OR public.user_in_enterprise(enterprise_id, auth.uid())
);

-- Allow updates by owner or workspace admins
CREATE POLICY "Workspace admins can update workspaces"
ON public.workspaces
FOR UPDATE
USING (
  owner_id = auth.uid() OR public.is_workspace_admin(id, auth.uid())
);

-- Optional: creation allowed for owners (usually handled via RPC)
CREATE POLICY "Users can create own workspaces"
ON public.workspaces
FOR INSERT
WITH CHECK (owner_id = auth.uid());

-- workspace_members: simple, non-recursive access
CREATE POLICY "Users can view memberships they are part of"
ON public.workspace_members
FOR SELECT
USING (
  user_id = auth.uid() OR public.is_workspace_admin(workspace_id, auth.uid())
);

CREATE POLICY "Users can leave workspaces"
ON public.workspace_members
FOR DELETE
USING (user_id = auth.uid());

-- 5) Backfill: ensure every workspace owner is an active member (prevents empty memberships)
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT w.id, w.owner_id, 'owner', 'active'
FROM public.workspaces w
LEFT JOIN public.workspace_members wm
  ON wm.workspace_id = w.id AND wm.user_id = w.owner_id
WHERE wm.id IS NULL;
