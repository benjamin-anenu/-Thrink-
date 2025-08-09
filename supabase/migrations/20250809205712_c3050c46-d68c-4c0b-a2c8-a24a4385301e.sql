-- Clean and rebuild conflicting policies to resolve recursion

-- Drop admin_permissions and change_control_board policies if they exist
DO $$
BEGIN
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Admins can view their own permissions" ON public.admin_permissions';
  EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "System owners can manage all admin permissions" ON public.admin_permissions';
  EXCEPTION WHEN undefined_object THEN NULL; END;
  BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "Enterprise owners can view all change control board" ON public.change_control_board';
  EXCEPTION WHEN undefined_object THEN NULL; END;
END $$;

-- Recreate policies relying on is_system_owner
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can view their own permissions"
ON public.admin_permissions
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System owners can manage all admin permissions"
ON public.admin_permissions
FOR ALL
USING (public.is_system_owner(auth.uid()));

ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enterprise owners can view all change control board"
ON public.change_control_board
FOR SELECT
USING (public.is_system_owner(auth.uid()));

-- Rebuild core table policies deterministically
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

-- Backfill workspace owners into memberships
INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
SELECT w.id, w.owner_id, 'owner', 'active'
FROM public.workspaces w
LEFT JOIN public.workspace_members wm
  ON wm.workspace_id = w.id AND wm.user_id = w.owner_id
WHERE wm.id IS NULL;
