-- Phase 1: Critical RLS Security Fixes
-- Enable RLS on all unprotected tables and add policies

-- 1. baseline_versions table
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage baseline versions in their workspace" 
ON public.baseline_versions 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 2. change_control_board table
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage change control board in their workspace" 
ON public.change_control_board 
FOR ALL 
USING (
  request_id IN (
    SELECT rre.id 
    FROM rebaseline_requests_enhanced rre
    JOIN projects p ON p.id = rre.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 3. notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = auth.uid());

-- 4. project_assignments table
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage project assignments in their workspace" 
ON public.project_assignments 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 5. rebaseline_approvals_workflow table
ALTER TABLE public.rebaseline_approvals_workflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rebaseline approvals in their workspace" 
ON public.rebaseline_approvals_workflow 
FOR ALL 
USING (
  request_id IN (
    SELECT rre.id 
    FROM rebaseline_requests_enhanced rre
    JOIN projects p ON p.id = rre.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 6. rebaseline_history table
ALTER TABLE public.rebaseline_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rebaseline history in their workspace" 
ON public.rebaseline_history 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "System can insert rebaseline history" 
ON public.rebaseline_history 
FOR INSERT 
WITH CHECK (true);

-- 7. rebaseline_requests_enhanced table
ALTER TABLE public.rebaseline_requests_enhanced ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rebaseline requests in their workspace" 
ON public.rebaseline_requests_enhanced 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 8. reports table
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reports in their workspace" 
ON public.reports 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- 9. time_tracking table
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage time tracking in their workspace" 
ON public.time_tracking 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Fix role-based access control vulnerabilities
-- Create function to prevent role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS TRIGGER AS $$
DECLARE
  current_user_role app_role;
  target_user_role app_role;
BEGIN
  -- Get current user's highest role
  SELECT role INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role 
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
    END
  LIMIT 1;

  -- Check if user is trying to modify their own role
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;

  -- Check if user is trying to assign a role higher than their own
  IF current_user_role IS NOT NULL THEN
    CASE 
      WHEN current_user_role = 'viewer' OR current_user_role = 'member' THEN
        RAISE EXCEPTION 'Insufficient permissions to manage roles';
      WHEN current_user_role = 'manager' AND NEW.role IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to user_roles table
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- Add policies to user_roles table to prevent unauthorized access
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

CREATE POLICY "Users can view roles in their workspace" 
ON public.user_roles 
FOR SELECT 
USING (
  user_id = auth.uid() OR 
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);

CREATE POLICY "Admins can manage roles" 
ON public.user_roles 
FOR ALL 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'owner'::app_role)
);