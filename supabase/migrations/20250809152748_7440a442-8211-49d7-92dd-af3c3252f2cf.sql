-- Step 1: Update auth types and add admin permissions table
-- First, update the app_role enum to match our new simplified role structure
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'workspace_admin';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'workspace_member'; 
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'workspace_viewer';

-- Create admin permissions table for granular admin access control
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT NOT NULL, -- 'workspace_access', 'user_management', 'system_settings', etc.
  permission_scope TEXT, -- specific workspace_id for workspace_access, or NULL for global
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(user_id, permission_type, permission_scope)
);

-- Enable RLS on admin permissions
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for admin permissions
CREATE POLICY "System owners can manage all admin permissions"
ON public.admin_permissions
FOR ALL
USING (is_system_owner(auth.uid()));

CREATE POLICY "Admins can view their own permissions"
ON public.admin_permissions
FOR SELECT
USING (user_id = auth.uid());

-- Update user_roles table structure for cleaner separation
-- Remove workspace_id from user_roles as it should only be for system-level roles
ALTER TABLE public.user_roles DROP COLUMN IF EXISTS workspace_id;

-- Ensure we have proper system owner tracking
ALTER TABLE public.user_roles 
ADD COLUMN IF NOT EXISTS is_system_owner BOOLEAN DEFAULT false;

-- Create function to check if user has specific admin permission
CREATE OR REPLACE FUNCTION public.has_admin_permission(_user_id UUID, _permission_type TEXT, _permission_scope TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_permissions
    WHERE user_id = _user_id
      AND permission_type = _permission_type
      AND (permission_scope = _permission_scope OR (_permission_scope IS NULL AND permission_scope IS NULL))
      AND is_active = true
  ) OR is_system_owner(_user_id);
$$;

-- Create function to get user's effective permissions context
CREATE OR REPLACE FUNCTION public.get_user_permissions_context(_user_id UUID)
RETURNS TABLE(
  is_system_owner BOOLEAN,
  system_role app_role,
  admin_permissions JSONB,
  workspace_memberships JSONB
)
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(ur.is_system_owner, false) as is_system_owner,
    ur.role as system_role,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'permission_type', permission_type,
          'permission_scope', permission_scope,
          'granted_by', granted_by
        )
      ) FROM public.admin_permissions 
       WHERE user_id = _user_id AND is_active = true), 
      '[]'::jsonb
    ) as admin_permissions,
    COALESCE(
      (SELECT jsonb_agg(
        jsonb_build_object(
          'workspace_id', workspace_id,
          'role', role,
          'status', status
        )
      ) FROM public.workspace_members 
       WHERE user_id = _user_id AND status = 'active'), 
      '[]'::jsonb
    ) as workspace_memberships
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id
  ORDER BY 
    CASE ur.role 
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'member' THEN 3
      WHEN 'viewer' THEN 4
    END
  LIMIT 1;
END;
$$;

-- Update workspace_members table to ensure proper roles
-- Add constraint to ensure workspace roles are correct
ALTER TABLE public.workspace_members 
ADD CONSTRAINT workspace_role_check 
CHECK (role IN ('owner', 'admin', 'member', 'viewer'));

-- Create updated trigger for better timestamp management
CREATE OR REPLACE FUNCTION public.update_admin_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_admin_permissions_updated_at
  BEFORE UPDATE ON public.admin_permissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_admin_permissions_updated_at();