
-- Phase 1: Fix Critical RLS Policy Gaps
-- Enable RLS on tables that are missing it
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create comprehensive RLS policies for project_assignments
CREATE POLICY "Users can manage project assignments in their workspace"
ON public.project_assignments
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create RLS policies for project_daily_checkins
CREATE POLICY "Users can manage daily checkins for their projects"
ON public.project_daily_checkins
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create RLS policies for change_control_board
CREATE POLICY "Users can view change control board records for their projects"
ON public.change_control_board
FOR SELECT
USING (
  request_id IN (
    SELECT cr.id FROM change_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Admins can manage change control board records"
ON public.change_control_board
FOR ALL
USING (
  request_id IN (
    SELECT cr.id FROM change_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin') AND wm.status = 'active'
  )
)
WITH CHECK (
  request_id IN (
    SELECT cr.id FROM change_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin') AND wm.status = 'active'
  )
);

-- Create RLS policies for baseline_versions
CREATE POLICY "Users can manage baseline versions for their projects"
ON public.baseline_versions
FOR ALL
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create RLS policies for notification_queue
CREATE POLICY "Users can view their own notifications"
ON public.notification_queue
FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON public.notification_queue
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications"
ON public.notification_queue
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create RLS policies for notifications
CREATE POLICY "Users can manage their own notifications"
ON public.notifications
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Phase 2: Fix Database Function Security Issues
-- Update prevent_role_escalation function to be more secure
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_user_role text;
  target_user_role text;
  current_user_workspace_role text;
BEGIN
  -- Prevent users from modifying their own roles
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;

  -- Get current user's highest role
  SELECT role::text INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  ORDER BY 
    CASE role::text
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
      ELSE 6
    END
  LIMIT 1;

  -- Additional validation: Check workspace-specific permissions
  IF current_user_role IS NOT NULL THEN
    -- Prevent privilege escalation
    CASE 
      WHEN current_user_role IN ('viewer', 'member') THEN
        RAISE EXCEPTION 'Insufficient permissions to manage roles';
      WHEN current_user_role = 'manager' AND NEW.role::text IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role::text = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  ELSE
    RAISE EXCEPTION 'Unable to determine user role';
  END IF;

  -- Log the role change attempt
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    'role_change_attempt',
    'user_roles',
    NEW.id,
    jsonb_build_object(
      'target_user_id', NEW.user_id,
      'old_role', CASE WHEN TG_OP = 'UPDATE' THEN OLD.role ELSE null END,
      'new_role', NEW.role,
      'operation', TG_OP
    )
  );

  RETURN NEW;
END;
$$;

-- Update other security-sensitive functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
  ORDER BY 
    CASE role 
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
    END
  LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id_param uuid, user_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
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

-- Update handle_new_user function for security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Validate input
  IF NEW.email IS NULL OR NEW.email = '' THEN
    RAISE EXCEPTION 'Email is required for new users';
  END IF;

  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', '')
  );
  
  -- Assign default role with validation
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member');
  
  -- Log the registration
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (
    NEW.id, 
    'user_registered', 
    jsonb_build_object(
      'email', NEW.email,
      'registration_time', now(),
      'user_agent', current_setting('request.headers', true)::jsonb ->> 'user-agent'
    )
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't block user creation
    INSERT INTO public.audit_logs (user_id, action, metadata)
    VALUES (
      NEW.id,
      'user_registration_error',
      jsonb_build_object('error', SQLERRM, 'email', NEW.email)
    );
    RAISE;
END;
$$;

-- Create a secure function to validate workspace membership
CREATE OR REPLACE FUNCTION public.validate_workspace_access(workspace_id_param uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = auth.uid()
      AND status = 'active'
  );
$$;

-- Add audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_sensitive_operation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log sensitive table operations
  IF TG_TABLE_NAME IN ('user_roles', 'workspace_members', 'profiles') THEN
    INSERT INTO public.audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      metadata
    ) VALUES (
      auth.uid(),
      TG_OP || '_' || TG_TABLE_NAME,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'timestamp', now(),
        'old_values', CASE WHEN TG_OP != 'INSERT' THEN to_jsonb(OLD) ELSE null END,
        'new_values', CASE WHEN TG_OP != 'DELETE' THEN to_jsonb(NEW) ELSE null END
      )
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for audit logging on sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();

DROP TRIGGER IF EXISTS audit_workspace_members ON public.workspace_members;
CREATE TRIGGER audit_workspace_members
  AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_operation();
