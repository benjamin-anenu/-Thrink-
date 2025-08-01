
-- Phase 1: Critical RLS Policy Implementation for Unprotected Tables

-- 1. Enable RLS and create policies for project_assignments table
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
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

-- 2. Enable RLS and create policies for project_daily_checkins table
ALTER TABLE public.project_daily_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage daily checkins for their projects"
  ON public.project_daily_checkins
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

-- 3. Enable RLS and create policies for change_control_board table
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage change control board records for their projects"
  ON public.change_control_board
  FOR ALL
  USING (
    request_id IN (
      SELECT cr.id
      FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT cr.id
      FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

-- 4. Enable RLS and create policies for baseline_versions table
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage baseline versions for their projects"
  ON public.baseline_versions
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

-- 5. Enable RLS and create policies for notification_queue table
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notification_queue
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notification_queue
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notification read status"
  ON public.notification_queue
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 6. Enable RLS and create policies for notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own notification read status"
  ON public.notifications
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Phase 2: Database Function Security Hardening - Update critical functions

-- Update prevent_role_escalation function with enhanced security
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
    END
  LIMIT 1;

  -- Check workspace-specific permissions if applicable
  IF TG_TABLE_NAME = 'workspace_members' THEN
    SELECT role INTO current_user_workspace_role
    FROM public.workspace_members
    WHERE user_id = auth.uid() 
    AND workspace_id = NEW.workspace_id
    AND status = 'active';
    
    -- Only workspace owners/admins can modify roles
    IF current_user_workspace_role NOT IN ('owner', 'admin') THEN
      RAISE EXCEPTION 'Insufficient workspace permissions to manage roles';
    END IF;
  END IF;

  -- Prevent self-modification
  IF TG_OP = 'UPDATE' AND OLD.user_id = auth.uid() THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;

  -- Prevent privilege escalation
  IF current_user_role IS NOT NULL THEN
    CASE 
      WHEN current_user_role IN ('viewer', 'member') THEN
        RAISE EXCEPTION 'Insufficient permissions to manage roles';
      WHEN current_user_role = 'manager' AND NEW.role::text IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role::text = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  END IF;

  -- Log the role change attempt
  INSERT INTO public.audit_logs (user_id, action, resource_type, resource_id, metadata)
  VALUES (
    auth.uid(),
    CASE TG_OP 
      WHEN 'INSERT' THEN 'role_assigned'
      WHEN 'UPDATE' THEN 'role_updated'
      WHEN 'DELETE' THEN 'role_removed'
    END,
    'user_role',
    NEW.user_id,
    jsonb_build_object(
      'old_role', CASE WHEN TG_OP = 'UPDATE' THEN OLD.role ELSE null END,
      'new_role', NEW.role,
      'target_user', NEW.user_id
    )
  );

  RETURN NEW;
END;
$$;

-- Update execute_sql function with enhanced security
CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
  clean_query text;
  current_user_role text;
BEGIN
  -- Check if user has admin privileges
  SELECT role::text INTO current_user_role
  FROM public.user_roles
  WHERE user_id = auth.uid()
  AND role IN ('owner', 'admin')
  LIMIT 1;
  
  IF current_user_role IS NULL THEN
    RAISE EXCEPTION 'Insufficient privileges to execute SQL queries';
  END IF;

  -- Clean and validate the query
  clean_query := trim(query);
  
  -- Security check: Only allow SELECT statements
  IF NOT (upper(clean_query) LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed. Query must start with SELECT.';
  END IF;
  
  -- Enhanced security: Block dangerous keywords and patterns
  IF upper(clean_query) ~ '.*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|COPY|BULK|IMPORT|EXPORT|BACKUP|RESTORE).*' THEN
    RAISE EXCEPTION 'Query contains forbidden keywords. Only SELECT operations are allowed.';
  END IF;
  
  -- Block potential schema manipulation
  IF upper(clean_query) ~ '.*(INFORMATION_SCHEMA|PG_|AUTH\.|STORAGE\.).*' THEN
    RAISE EXCEPTION 'Access to system schemas is forbidden.';
  END IF;
  
  -- Log the query execution
  INSERT INTO public.audit_logs (user_id, action, metadata)
  VALUES (
    auth.uid(),
    'sql_query_executed',
    jsonb_build_object('query', clean_query, 'timestamp', now())
  );
  
  -- Execute the query and return as JSON
  EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || clean_query || ') t' INTO result;
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error
    INSERT INTO public.audit_logs (user_id, action, metadata)
    VALUES (
      auth.uid(),
      'sql_query_error',
      jsonb_build_object('query', clean_query, 'error', SQLERRM, 'timestamp', now())
    );
    
    -- Return error information as JSON
    RETURN json_build_object(
      'error', true,
      'message', SQLERRM,
      'code', SQLSTATE
    );
END;
$$;

-- Add comprehensive audit logging trigger for sensitive operations
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log operations on sensitive tables
  INSERT INTO public.audit_logs (
    user_id, 
    action, 
    resource_type, 
    resource_id, 
    metadata
  )
  VALUES (
    auth.uid(),
    TG_OP || '_' || TG_TABLE_NAME,
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object(
      'table', TG_TABLE_NAME,
      'operation', TG_OP,
      'timestamp', now(),
      'old_data', CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE null END,
      'new_data', CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE null END
    )
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply audit triggers to sensitive tables
DROP TRIGGER IF EXISTS audit_user_roles ON public.user_roles;
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();

DROP TRIGGER IF EXISTS audit_workspace_members ON public.workspace_members;
CREATE TRIGGER audit_workspace_members
  AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION public.audit_sensitive_operations();
