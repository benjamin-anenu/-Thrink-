
-- Phase 1: Critical Database Security Fixes

-- 1. Enable RLS on tables that have policies but disabled RLS
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Add missing RLS policies for tables with enabled RLS but no policies
CREATE POLICY "Users can manage baseline versions in their workspace" 
  ON public.baseline_versions 
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    ) OR 
    task_id IN (
      SELECT pt.id FROM project_tasks pt
      JOIN projects p ON p.id = pt.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage change control board in their workspace" 
  ON public.change_control_board 
  FOR ALL
  USING (
    request_id IN (
      SELECT cr.id FROM change_requests cr
      JOIN projects p ON p.id = cr.project_id
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage project assignments in their workspace" 
  ON public.project_assignments 
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage project daily checkins in their workspace" 
  ON public.project_daily_checkins 
  FOR ALL
  USING (
    project_id IN (
      SELECT p.id FROM projects p
      JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
      WHERE wm.user_id = auth.uid() AND wm.status = 'active'
    )
  );

CREATE POLICY "Users can manage their own notifications" 
  ON public.notification_queue 
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can manage their own notifications" 
  ON public.notifications 
  FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Fix SQL injection vulnerability by replacing execute_sql function
DROP FUNCTION IF EXISTS public.execute_sql(text);

-- Create secure SQL execution function with strict validation
CREATE OR REPLACE FUNCTION public.execute_secure_query(
  query_type text,
  table_name text,
  workspace_filter uuid,
  additional_filters jsonb DEFAULT '{}'::jsonb,
  limit_count integer DEFAULT 50
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  result json;
  safe_query text;
  allowed_tables text[] := ARRAY[
    'projects', 'project_tasks', 'resources', 'performance_profiles', 
    'milestones', 'phases', 'client_satisfaction', 'monthly_performance_reports'
  ];
BEGIN
  -- Validate inputs
  IF query_type NOT IN ('select', 'count') THEN
    RAISE EXCEPTION 'Invalid query type. Only SELECT and COUNT are allowed.';
  END IF;
  
  IF table_name != ANY(allowed_tables) THEN
    RAISE EXCEPTION 'Table % is not allowed for queries.', table_name;
  END IF;
  
  IF workspace_filter IS NULL THEN
    RAISE EXCEPTION 'Workspace filter is required.';
  END IF;
  
  IF limit_count > 100 OR limit_count < 1 THEN
    RAISE EXCEPTION 'Limit must be between 1 and 100.';
  END IF;
  
  -- Build safe query based on table and type
  CASE table_name
    WHEN 'projects' THEN
      IF query_type = 'select' THEN
        safe_query := format(
          'SELECT json_agg(row_to_json(t)) FROM (
            SELECT id, name, description, status, priority, start_date, end_date, progress, created_at, updated_at 
            FROM projects 
            WHERE workspace_id = %L 
            ORDER BY created_at DESC 
            LIMIT %L
          ) t',
          workspace_filter, limit_count
        );
      ELSE
        safe_query := format(
          'SELECT json_build_object(''count'', COUNT(*)) FROM projects WHERE workspace_id = %L',
          workspace_filter
        );
      END IF;
      
    WHEN 'project_tasks' THEN
      IF query_type = 'select' THEN
        safe_query := format(
          'SELECT json_agg(row_to_json(t)) FROM (
            SELECT pt.id, pt.name, pt.description, pt.status, pt.priority, pt.progress, 
                   pt.start_date, pt.end_date, pt.assignee_id, pt.project_id, p.name as project_name
            FROM project_tasks pt 
            JOIN projects p ON p.id = pt.project_id 
            WHERE p.workspace_id = %L 
            ORDER BY pt.created_at DESC 
            LIMIT %L
          ) t',
          workspace_filter, limit_count
        );
      ELSE
        safe_query := format(
          'SELECT json_build_object(''count'', COUNT(*)) 
           FROM project_tasks pt 
           JOIN projects p ON p.id = pt.project_id 
           WHERE p.workspace_id = %L',
          workspace_filter
        );
      END IF;
      
    WHEN 'resources' THEN
      IF query_type = 'select' THEN
        safe_query := format(
          'SELECT json_agg(row_to_json(t)) FROM (
            SELECT id, name, email, role, department, skills, availability_hours, created_at 
            FROM resources 
            WHERE workspace_id = %L 
            ORDER BY created_at DESC 
            LIMIT %L
          ) t',
          workspace_filter, limit_count
        );
      ELSE
        safe_query := format(
          'SELECT json_build_object(''count'', COUNT(*)) FROM resources WHERE workspace_id = %L',
          workspace_filter
        );
      END IF;
      
    WHEN 'performance_profiles' THEN
      IF query_type = 'select' THEN
        safe_query := format(
          'SELECT json_agg(row_to_json(t)) FROM (
            SELECT id, resource_id, resource_name, current_score, monthly_score, trend, risk_level, 
                   strengths, improvement_areas, created_at 
            FROM performance_profiles 
            WHERE workspace_id = %L 
            ORDER BY current_score DESC 
            LIMIT %L
          ) t',
          workspace_filter, limit_count
        );
      ELSE
        safe_query := format(
          'SELECT json_build_object(''count'', COUNT(*)) FROM performance_profiles WHERE workspace_id = %L',
          workspace_filter
        );
      END IF;
      
    ELSE
      RAISE EXCEPTION 'Query building not implemented for table: %', table_name;
  END CASE;
  
  -- Execute the safe query
  EXECUTE safe_query INTO result;
  
  -- Return empty array if no results
  RETURN COALESCE(result, '[]'::json);
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log error for monitoring
    INSERT INTO public.compliance_logs (
      event_type, event_category, description, metadata, workspace_id
    ) VALUES (
      'security_sql_error', 'database', 
      'Secure query execution failed',
      jsonb_build_object('error', SQLERRM, 'table', table_name, 'query_type', query_type),
      workspace_filter
    );
    
    RETURN json_build_object(
      'error', true,
      'message', 'Query execution failed due to security constraints'
    );
END;
$$;

-- 4. Create query execution logging function
CREATE OR REPLACE FUNCTION public.log_query_execution(
  user_id_param uuid,
  query_info jsonb,
  execution_time_ms integer,
  success boolean,
  error_message text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.compliance_logs (
    user_id, event_type, event_category, description, metadata
  ) VALUES (
    user_id_param,
    CASE WHEN success THEN 'query_executed' ELSE 'query_failed' END,
    'database',
    CASE WHEN success 
      THEN 'Database query executed successfully' 
      ELSE 'Database query execution failed' 
    END,
    jsonb_build_object(
      'query_info', query_info,
      'execution_time_ms', execution_time_ms,
      'success', success,
      'error_message', error_message,
      'timestamp', NOW()
    )
  );
END;
$$;

-- 5. Create security event logging function for comprehensive monitoring
CREATE OR REPLACE FUNCTION public.log_security_event(
  event_type_param text,
  event_category_param text,
  description_param text,
  severity_param text DEFAULT 'medium',
  user_id_param uuid DEFAULT NULL,
  workspace_id_param uuid DEFAULT NULL,
  metadata_param jsonb DEFAULT '{}'::jsonb,
  ip_address_param inet DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  log_id uuid;
BEGIN
  INSERT INTO public.compliance_logs (
    user_id, workspace_id, event_type, event_category, description, 
    metadata, ip_address
  ) VALUES (
    COALESCE(user_id_param, auth.uid()),
    workspace_id_param,
    'security_' || event_type_param,
    event_category_param,
    description_param,
    metadata_param || jsonb_build_object(
      'severity', severity_param,
      'timestamp', NOW()
    ),
    ip_address_param
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$;

-- 6. Update existing database functions with proper search_path
CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(workspace_name text, workspace_description text DEFAULT NULL::text, workspace_slug text DEFAULT NULL::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  new_workspace_id UUID;
  generated_slug TEXT;
BEGIN
  -- Generate slug if not provided
  IF workspace_slug IS NULL THEN
    generated_slug := lower(regexp_replace(workspace_name, '[^a-zA-Z0-9]', '-', 'g'));
    generated_slug := regexp_replace(generated_slug, '-+', '-', 'g');
    generated_slug := trim(both '-' from generated_slug);
    
    -- Ensure uniqueness
    WHILE EXISTS (SELECT 1 FROM workspaces WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := workspace_slug;
  END IF;

  -- Create workspace
  INSERT INTO workspaces (name, description, slug, owner_id)
  VALUES (workspace_name, workspace_description, generated_slug, auth.uid())
  RETURNING id INTO new_workspace_id;

  -- Add owner as member
  INSERT INTO workspace_members (workspace_id, user_id, role, status)
  VALUES (new_workspace_id, auth.uid(), 'owner', 'active');

  -- Log the creation
  PERFORM log_security_event(
    'workspace_created', 'user_management',
    'Workspace created: ' || workspace_name,
    'low', auth.uid(), new_workspace_id,
    jsonb_build_object('workspace_name', workspace_name)
  );

  RETURN new_workspace_id;
END;
$$;

-- 7. Create session management functions
CREATE OR REPLACE FUNCTION public.create_secure_session(
  session_id text,
  workspace_id uuid,
  device_fingerprint text DEFAULT NULL,
  ip_address inet DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  session_uuid uuid;
  active_sessions_count integer;
BEGIN
  -- Check concurrent session limit (max 3 per user)
  SELECT COUNT(*) INTO active_sessions_count
  FROM user_sessions
  WHERE user_id = auth.uid() AND expires_at > NOW();
  
  IF active_sessions_count >= 3 THEN
    -- Remove oldest session
    DELETE FROM user_sessions
    WHERE id IN (
      SELECT id FROM user_sessions
      WHERE user_id = auth.uid() AND expires_at > NOW()
      ORDER BY created_at ASC
      LIMIT 1
    );
  END IF;
  
  -- Create new session
  INSERT INTO user_sessions (
    user_id, session_id, workspace_id, ip_address, device_info, expires_at
  ) VALUES (
    auth.uid(), session_id, workspace_id, ip_address,
    jsonb_build_object('fingerprint', device_fingerprint, 'created_at', NOW()),
    NOW() + INTERVAL '30 minutes'
  ) RETURNING id INTO session_uuid;
  
  -- Log session creation
  PERFORM log_security_event(
    'session_created', 'authentication',
    'New secure session created',
    'low', auth.uid(), workspace_id,
    jsonb_build_object('session_id', session_id, 'device_fingerprint', device_fingerprint),
    ip_address
  );
  
  RETURN session_uuid;
END;
$$;
