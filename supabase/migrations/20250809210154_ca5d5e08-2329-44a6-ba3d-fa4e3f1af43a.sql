-- Ensure helper functions exist before policy creation
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

-- Drop and recreate core policies referencing helpers
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

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own roles"
ON public.user_roles
FOR SELECT
USING (user_id = auth.uid());

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

CREATE POLICY "Users can view workspaces they have access to"
ON public.workspaces
FOR SELECT
USING (
  owner_id = auth.uid()
  OR public.user_in_workspace(id, auth.uid())
  OR public.user_in_enterprise(enterprise_id, auth.uid())
);

CREATE POLICY "Workspace admins can update workspaces"
ON public.workspaces
FOR UPDATE
USING (
  owner_id = auth.uid() OR public.is_workspace_admin(id, auth.uid())
);

CREATE POLICY "Users can create own workspaces"
ON public.workspaces
FOR INSERT
WITH CHECK (owner_id = auth.uid());

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
