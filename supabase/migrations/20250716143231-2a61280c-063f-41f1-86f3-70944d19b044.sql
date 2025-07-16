-- Fix infinite recursion in workspace_members RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Workspace admins can manage members" ON public.workspace_members;

-- Create a security definer function to check workspace membership
CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND status = 'active'
  );
$$;

-- Create a security definer function to check workspace admin access
CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$$;

-- Create new RLS policies using the security definer functions
CREATE POLICY "Users can view members of their workspaces" 
ON public.workspace_members 
FOR SELECT 
USING (public.is_workspace_member(workspace_id, auth.uid()));

CREATE POLICY "Workspace admins can manage members" 
ON public.workspace_members 
FOR ALL 
USING (public.is_workspace_admin(workspace_id, auth.uid()))
WITH CHECK (public.is_workspace_admin(workspace_id, auth.uid()));

-- Also create a policy for users to insert themselves when accepting invitations
CREATE POLICY "Users can insert themselves as members"
ON public.workspace_members
FOR INSERT
WITH CHECK (user_id = auth.uid());