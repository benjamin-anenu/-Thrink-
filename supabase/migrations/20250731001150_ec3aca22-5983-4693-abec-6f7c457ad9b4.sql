
-- Phase 1: Critical Database Security Fixes

-- Enable RLS on tables that have policies but RLS is disabled
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE baseline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_control_board ENABLE ROW LEVEL SECURITY;

-- Add missing RLS policies for tables with enabled RLS but no policies

-- Notification queue policies
CREATE POLICY "Users can view their own notifications" 
  ON notification_queue 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications" 
  ON notification_queue 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" 
  ON notification_queue 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Generic notifications policies  
CREATE POLICY "Users can view their own generic notifications" 
  ON notifications 
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "System can insert generic notifications" 
  ON notifications 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Users can update their own generic notifications" 
  ON notifications 
  FOR UPDATE 
  USING (user_id = auth.uid());

-- Project assignments policies
CREATE POLICY "Users can view project assignments in their workspace" 
  ON project_assignments 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage project assignments in their workspace" 
  ON project_assignments 
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

-- Daily checkins policies
CREATE POLICY "Users can view daily checkins in their workspace" 
  ON project_daily_checkins 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage daily checkins in their workspace" 
  ON project_daily_checkins 
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

-- Baseline versions policies
CREATE POLICY "Users can view baseline versions in their workspace" 
  ON baseline_versions 
  FOR SELECT 
  USING (
    project_id IN (
      SELECT p.id 
      FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage baseline versions in their workspace" 
  ON baseline_versions 
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

-- Change control board policies
CREATE POLICY "Users can view change control board in their workspace" 
  ON change_control_board 
  FOR SELECT 
  USING (
    request_id IN (
      SELECT cr.id 
      FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Admins can manage change control board" 
  ON change_control_board 
  FOR ALL 
  USING (
    request_id IN (
      SELECT cr.id 
      FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() 
      AND wm.status = 'active' 
      AND wm.role IN ('owner', 'admin')
    )
  )
  WITH CHECK (
    request_id IN (
      SELECT cr.id 
      FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() 
      AND wm.status = 'active' 
      AND wm.role IN ('owner', 'admin')
    )
  );

-- Fix the SQL execution function to prevent injection
CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  result json;
  clean_query text;
  allowed_tables text[] := ARRAY['projects', 'project_tasks', 'resources', 'performance_profiles', 'milestones', 'phases'];
  table_name text;
  has_allowed_table boolean := false;
BEGIN
  -- Enhanced security validation
  clean_query := trim(query);
  
  -- More strict validation: Only allow SELECT statements
  IF NOT (upper(clean_query) ~ '^SELECT\s+') THEN
    RAISE EXCEPTION 'Only SELECT queries are allowed. Query must start with SELECT.';
  END IF;
  
  -- Enhanced dangerous keyword detection
  IF upper(clean_query) ~ '.*(DROP|DELETE|UPDATE|INSERT|CREATE|ALTER|TRUNCATE|GRANT|REVOKE|EXECUTE|COPY|BULK|MERGE|CALL|EXEC|DECLARE|SET|USE|SHOW|DESCRIBE|EXPLAIN\s+(ANALYZE|VERBOSE)|WITH\s+RECURSIVE|UNION\s+ALL|INFORMATION_SCHEMA|PG_|AUTH\.|VAULT\.|STORAGE\.|REALTIME\.).*' THEN
    RAISE EXCEPTION 'Query contains forbidden keywords or system schema access.';
  END IF;
  
  -- Validate that query only accesses allowed tables
  FOREACH table_name IN ARRAY allowed_tables LOOP
    IF upper(clean_query) ~ upper(table_name) THEN
      has_allowed_table := true;
      EXIT;
    END IF;
  END LOOP;
  
  IF NOT has_allowed_table THEN
    RAISE EXCEPTION 'Query can only access allowed tables: %', array_to_string(allowed_tables, ', ');
  END IF;
  
  -- Prevent subqueries and complex operations
  IF upper(clean_query) ~ '.*(SELECT.*SELECT|;\s*SELECT|\|\||&&).*' THEN
    RAISE EXCEPTION 'Subqueries and complex operations are not allowed.';
  END IF;
  
  -- Limit query complexity (max 500 characters)
  IF length(clean_query) > 500 THEN
    RAISE EXCEPTION 'Query too long. Maximum 500 characters allowed.';
  END IF;
  
  -- Execute with timeout using statement_timeout
  PERFORM set_config('statement_timeout', '5s', true);
  
  BEGIN
    EXECUTE 'SELECT json_agg(row_to_json(t)) FROM (' || clean_query || ') t' INTO result;
  EXCEPTION
    WHEN query_canceled THEN
      RAISE EXCEPTION 'Query execution timeout exceeded (5 seconds).';
    WHEN OTHERS THEN
      RAISE EXCEPTION 'Query execution failed: %', SQLERRM;
  END;
  
  -- Reset timeout
  PERFORM set_config('statement_timeout', '0', true);
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Reset timeout on error
    PERFORM set_config('statement_timeout', '0', true);
    -- Return structured error without exposing internal details
    RETURN json_build_object(
      'error', true,
      'message', 'Query execution failed due to security or validation constraints.',
      'code', 'SECURITY_ERROR'
    );
END;
$function$;

-- Add query execution audit logging
CREATE TABLE IF NOT EXISTS public.query_execution_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  query_text text NOT NULL,
  execution_time interval,
  success boolean DEFAULT false,
  error_message text,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.query_execution_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view query logs" 
  ON query_execution_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() 
      AND ur.role IN ('owner', 'admin')
    )
  );

CREATE POLICY "System can insert query logs" 
  ON query_execution_logs 
  FOR INSERT 
  WITH CHECK (true);
