
-- Phase 1: Critical Database Security Fixes

-- 1. Add missing RLS policies for tables that have RLS enabled but no policies

-- Fix audit_logs table - add missing policies
CREATE POLICY "Users can insert their own audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Fix baseline_versions table
CREATE POLICY "Users can manage baseline versions in their workspace" 
ON public.baseline_versions 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Fix change_control_board table
CREATE POLICY "Users can manage change control board in their workspace" 
ON public.change_control_board 
FOR ALL 
USING (
  request_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Fix notification_queue table
CREATE POLICY "Users can view their own notifications" 
ON public.notification_queue 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" 
ON public.notification_queue 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
ON public.notification_queue 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fix notifications table
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Fix project_assignments table
CREATE POLICY "Users can view project assignments in their workspace" 
ON public.project_assignments 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Users can manage project assignments in their workspace" 
ON public.project_assignments 
FOR INSERT, UPDATE, DELETE 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.role IN ('owner', 'admin', 'manager') AND wm.status = 'active'
  )
);

-- Fix project_daily_checkins table
CREATE POLICY "Users can manage project checkins in their workspace" 
ON public.project_daily_checkins 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 2. Fix database functions security - add proper search_path

-- Fix has_role function (the overloaded one)
CREATE OR REPLACE FUNCTION public.has_role(check_role text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
    user_role text;
BEGIN
    SELECT role INTO user_role 
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
    
    RETURN user_role = check_role;
END;
$function$;

-- Fix execute_sql function to be more secure
CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  result json;
  clean_query text;
  current_user_id uuid;
BEGIN
  -- Get current user
  current_user_id := auth.uid();
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Clean and validate the query
  clean_query := trim(query);
  
  -- Security check: Only allow SELECT statements
  IF NOT (upper(clean_query) LIKE 'SELECT%') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed. Query must start with SELECT.';
  END IF;
  
  -- Additional security: Block dangerous keywords
  IF upper(clean_query) ~ '.*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|UNION(?!\s+SELECT)|SCRIPT|JAVASCRIPT|VBSCRIPT|ONLOAD|ONERROR).*' THEN
    RAISE EXCEPTION 'Query contains forbidden keywords. Only SELECT operations are allowed.';
  END IF;
  
  -- Limit query length
  IF length(clean_query) > 1000 THEN
    RAISE EXCEPTION 'Query too long. Maximum 1000 characters allowed.';
  END IF;
  
  -- Execute the query with timeout
  BEGIN
    EXECUTE 'SET statement_timeout = ''5s''';
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || clean_query || ') t' INTO result;
  EXCEPTION
    WHEN query_canceled THEN
      RAISE EXCEPTION 'Query execution timeout. Query must complete within 5 seconds.';
  END;
  
  -- Limit result size
  IF pg_column_size(result) > 1048576 THEN -- 1MB limit
    RAISE EXCEPTION 'Query result too large. Maximum 1MB result size allowed.';
  END IF;
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log security incident
    INSERT INTO public.compliance_logs (
      user_id, event_type, event_category, description, metadata
    ) VALUES (
      current_user_id, 'security_sql_query_blocked', 'security',
      'Potentially malicious SQL query blocked', 
      jsonb_build_object('query', left(clean_query, 200), 'error', SQLERRM)
    );
    
    -- Return error information as JSON
    RETURN json_build_object(
      'error', true,
      'message', 'Query execution failed due to security restrictions',
      'code', SQLSTATE
    );
END;
$function$;

-- 3. Add role escalation prevention trigger
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_role text;
  current_user_id uuid;
BEGIN
  current_user_id := auth.uid();
  
  -- Get current user's highest role
  SELECT role::text INTO current_user_role
  FROM public.user_roles
  WHERE user_id = current_user_id
  ORDER BY 
    CASE role::text
      WHEN 'owner' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'manager' THEN 3
      WHEN 'member' THEN 4
      WHEN 'viewer' THEN 5
    END
  LIMIT 1;

  -- Check if user is trying to modify their own role
  IF TG_OP = 'UPDATE' AND OLD.user_id = current_user_id THEN
    RAISE EXCEPTION 'Users cannot modify their own roles';
  END IF;

  -- Prevent users from creating roles for themselves
  IF TG_OP = 'INSERT' AND NEW.user_id = current_user_id THEN
    RAISE EXCEPTION 'Users cannot assign roles to themselves';
  END IF;

  -- Check if user is trying to assign a role higher than their own
  IF current_user_role IS NOT NULL THEN
    CASE 
      WHEN current_user_role IN ('viewer', 'member') THEN
        RAISE EXCEPTION 'Insufficient permissions to manage roles';
      WHEN current_user_role = 'manager' AND NEW.role::text IN ('owner', 'admin') THEN
        RAISE EXCEPTION 'Cannot assign roles higher than manager';
      WHEN current_user_role = 'admin' AND NEW.role::text = 'owner' THEN
        RAISE EXCEPTION 'Cannot assign owner role';
    END CASE;
  ELSE
    RAISE EXCEPTION 'User role not found or insufficient permissions';
  END IF;

  -- Log role change attempt
  INSERT INTO public.compliance_logs (
    user_id, event_type, event_category, description, metadata
  ) VALUES (
    current_user_id, 'security_role_change', 'user_management',
    'Role change attempted', 
    jsonb_build_object(
      'target_user', NEW.user_id,
      'old_role', CASE WHEN TG_OP = 'UPDATE' THEN OLD.role::text ELSE null END,
      'new_role', NEW.role::text,
      'operation', TG_OP
    )
  );

  RETURN NEW;
END;
$function$;

-- Apply the trigger
DROP TRIGGER IF EXISTS prevent_role_escalation ON public.user_roles;
CREATE TRIGGER prevent_role_escalation
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION prevent_role_escalation();

-- 4. Add comprehensive audit logging trigger
CREATE OR REPLACE FUNCTION public.audit_sensitive_operations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  current_user_id uuid;
  operation_data jsonb;
BEGIN
  current_user_id := auth.uid();
  
  -- Build operation data based on trigger operation
  CASE TG_OP
    WHEN 'INSERT' THEN
      operation_data := jsonb_build_object(
        'operation', 'INSERT',
        'table', TG_TABLE_NAME,
        'new_data', to_jsonb(NEW)
      );
    WHEN 'UPDATE' THEN
      operation_data := jsonb_build_object(
        'operation', 'UPDATE',
        'table', TG_TABLE_NAME,
        'old_data', to_jsonb(OLD),
        'new_data', to_jsonb(NEW),
        'changes', jsonb_build_object(
          'changed_fields', (
            SELECT array_agg(key) 
            FROM jsonb_each(to_jsonb(NEW)) 
            WHERE to_jsonb(NEW) -> key != to_jsonb(OLD) -> key
          )
        )
      );
    WHEN 'DELETE' THEN
      operation_data := jsonb_build_object(
        'operation', 'DELETE',
        'table', TG_TABLE_NAME,
        'deleted_data', to_jsonb(OLD)
      );
  END CASE;
  
  -- Log the operation
  INSERT INTO public.compliance_logs (
    user_id, event_type, event_category, description, metadata
  ) VALUES (
    current_user_id,
    'security_sensitive_operation',
    'data_modification',
    'Sensitive data operation on ' || TG_TABLE_NAME,
    operation_data
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Apply audit logging to sensitive tables
CREATE TRIGGER audit_user_roles 
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

CREATE TRIGGER audit_workspace_members 
  AFTER INSERT OR UPDATE OR DELETE ON public.workspace_members
  FOR EACH ROW EXECUTE FUNCTION audit_sensitive_operations();

-- 5. Add session security table and functions
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  workspace_id uuid,
  ip_address inet,
  user_agent text,
  device_info jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  last_activity timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, session_id)
);

-- Enable RLS on user_sessions
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to cleanup expired sessions
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  deleted_count integer;
BEGIN
  -- Delete expired sessions
  DELETE FROM public.user_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log cleanup operation
  INSERT INTO public.compliance_logs (
    event_type, event_category, description, metadata
  ) VALUES (
    'security_session_cleanup', 'maintenance',
    'Expired sessions cleaned up',
    jsonb_build_object('deleted_count', deleted_count)
  );
  
  RETURN deleted_count;
END;
$function$;
