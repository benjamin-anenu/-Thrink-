
-- Security fixes migration for RLS, function search paths, and policies

-- Enable RLS on tables that are missing it
ALTER TABLE IF EXISTS public.project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.baseline_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.change_control_board ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rebaseline_approvals_workflow ENABLE ROW LEVEL SECURITY;

-- Fix function search paths (set to public schema)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
 RETURNS app_role
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_member(workspace_id_param uuid, user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.is_workspace_admin(workspace_id_param uuid, user_id_param uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
      AND role IN ('owner', 'admin')
      AND status = 'active'
  );
$function$;

CREATE OR REPLACE FUNCTION public.create_milestone(p_project_id uuid, p_name text, p_description text DEFAULT NULL::text, p_due_date date DEFAULT NULL::date)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  milestone_id uuid;
BEGIN
  INSERT INTO milestones (project_id, name, description, due_date, baseline_date)
  VALUES (p_project_id, p_name, p_description, p_due_date, p_due_date)
  RETURNING id INTO milestone_id;
  
  RETURN milestone_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_task_dependencies(task_id_param uuid)
 RETURNS TABLE(dependent_task_id uuid, dependent_task_name text, dependency_type text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id as dependent_task_id,
    pt.name as dependent_task_name,
    'blocks_task'::text as dependency_type
  FROM project_tasks pt
  WHERE task_id_param = ANY(pt.dependencies);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_workspace_with_owner(workspace_name text, workspace_description text DEFAULT NULL::text, workspace_slug text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
    WHILE EXISTS (SELECT 1 FROM public.workspaces WHERE slug = generated_slug) LOOP
      generated_slug := generated_slug || '-' || floor(random() * 1000)::text;
    END LOOP;
  ELSE
    generated_slug := workspace_slug;
  END IF;

  -- Create workspace
  INSERT INTO public.workspaces (name, description, slug, owner_id)
  VALUES (workspace_name, workspace_description, generated_slug, auth.uid())
  RETURNING id INTO new_workspace_id;

  -- Add owner as member
  INSERT INTO public.workspace_members (workspace_id, user_id, role, status)
  VALUES (new_workspace_id, auth.uid(), 'owner', 'active');

  -- Log the creation
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    new_workspace_id, auth.uid(), 'workspace_created', 'user_management',
    'Workspace created: ' || workspace_name
  );

  RETURN new_workspace_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_workspace_invitation(invitation_token uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  invitation_record RECORD;
  user_email TEXT;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM auth.users 
  WHERE id = auth.uid();

  -- Get invitation details
  SELECT * INTO invitation_record
  FROM public.workspace_invitations
  WHERE invitation_token = accept_workspace_invitation.invitation_token
    AND email = user_email
    AND status = 'pending'
    AND expires_at > now();

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Add user to workspace
  INSERT INTO public.workspace_members (workspace_id, user_id, role, invited_by, status)
  VALUES (
    invitation_record.workspace_id,
    auth.uid(),
    invitation_record.role,
    invitation_record.invited_by,
    'active'
  );

  -- Update invitation status
  UPDATE public.workspace_invitations
  SET status = 'accepted', accepted_at = now()
  WHERE id = invitation_record.id;

  -- Log the acceptance
  INSERT INTO public.compliance_logs (
    workspace_id, user_id, event_type, event_category, description
  ) VALUES (
    invitation_record.workspace_id, auth.uid(), 'invitation_accepted', 'user_management',
    'User accepted workspace invitation'
  );

  RETURN TRUE;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_user_session(session_id_param text, workspace_id_param uuid DEFAULT NULL::uuid, ip_address_param inet DEFAULT NULL::inet, user_agent_param text DEFAULT NULL::text, device_info_param jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  session_uuid UUID;
BEGIN
  INSERT INTO public.user_sessions (
    user_id, session_id, workspace_id, ip_address, user_agent, device_info, expires_at
  ) VALUES (
    auth.uid(), session_id_param, workspace_id_param, ip_address_param, 
    user_agent_param, device_info_param, now() + interval '24 hours'
  )
  RETURNING id INTO session_uuid;

  RETURN session_uuid;
END;
$function$;

-- Fix other functions with search paths
CREATE OR REPLACE FUNCTION public.validate_task_dependencies()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  dep_task record;
  dep_string text;
  dep_task_id uuid;
BEGIN
  -- Check if task has dependencies
  IF NEW.dependencies IS NOT NULL AND array_length(NEW.dependencies, 1) > 0 THEN
    -- Check each dependency for circular references and adjust dates
    FOREACH dep_string IN ARRAY NEW.dependencies LOOP
      -- Properly extract and cast UUID from dependency string (format: taskId:type:lag)
      BEGIN
        dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          -- Skip invalid UUIDs
          CONTINUE;
      END;
      
      -- Get dependency task details
      SELECT id, end_date, dependencies INTO dep_task
      FROM project_tasks 
      WHERE id = dep_task_id;
      
      IF dep_task.id IS NOT NULL THEN
        -- Check for direct circular dependency
        IF dep_task.id = NEW.id THEN
          RAISE EXCEPTION 'Circular dependency detected: Task cannot depend on itself';
        END IF;
        
        -- Check for indirect circular dependencies
        IF NEW.id::text = ANY(dep_task.dependencies) THEN
          RAISE EXCEPTION 'Circular dependency detected: Task % already depends on task %', dep_task.id, NEW.id;
        END IF;
        
        -- If dependency end date is after this task's start date, adjust start date
        IF dep_task.end_date IS NOT NULL AND dep_task.end_date >= NEW.start_date THEN
          NEW.start_date := dep_task.end_date + INTERVAL '1 day';
          -- Recalculate end date based on duration
          IF NEW.duration IS NOT NULL THEN
            NEW.end_date := NEW.start_date + (NEW.duration - 1) * INTERVAL '1 day';
          END IF;
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_task_hierarchy()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  max_depth INTEGER := 5;
  current_depth INTEGER := 0;
  check_parent_id UUID;
BEGIN
  -- If parent_task_id is set, validate hierarchy depth
  IF NEW.parent_task_id IS NOT NULL THEN
    -- Check for circular references
    check_parent_id := NEW.parent_task_id;
    current_depth := 1;
    
    WHILE check_parent_id IS NOT NULL AND current_depth <= max_depth LOOP
      -- Check if we've created a circular reference
      IF check_parent_id = NEW.id THEN
        RAISE EXCEPTION 'Circular reference detected in task hierarchy';
      END IF;
      
      -- Get the parent's parent
      SELECT parent_task_id INTO check_parent_id 
      FROM project_tasks 
      WHERE id = check_parent_id;
      
      current_depth := current_depth + 1;
    END LOOP;
    
    -- Check if we exceeded max depth
    IF current_depth > max_depth THEN
      RAISE EXCEPTION 'Task hierarchy depth cannot exceed % levels', max_depth;
    END IF;
    
    -- Set hierarchy level based on parent
    SELECT hierarchy_level + 1 INTO NEW.hierarchy_level
    FROM project_tasks 
    WHERE id = NEW.parent_task_id;
    
    -- Ensure parent task is in the same project
    IF NOT EXISTS (
      SELECT 1 FROM project_tasks 
      WHERE id = NEW.parent_task_id 
      AND project_id = NEW.project_id
    ) THEN
      RAISE EXCEPTION 'Parent task must be in the same project';
    END IF;
  ELSE
    -- Root level task
    NEW.hierarchy_level := 0;
  END IF;
  
  -- Set default sort_order if not specified
  IF NEW.sort_order IS NULL OR NEW.sort_order = 0 THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 
    INTO NEW.sort_order
    FROM project_tasks 
    WHERE project_id = NEW.project_id 
    AND COALESCE(parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
        COALESCE(NEW.parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Continue fixing the remaining functions...
CREATE OR REPLACE FUNCTION public.get_task_hierarchy(p_project_id uuid)
 RETURNS TABLE(id uuid, name text, parent_task_id uuid, hierarchy_level integer, sort_order integer, has_children boolean, path text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH RECURSIVE task_tree AS (
    -- Root tasks (no parent)
    SELECT 
      t.id,
      t.name,
      t.parent_task_id,
      t.hierarchy_level,
      t.sort_order,
      EXISTS(SELECT 1 FROM project_tasks c WHERE c.parent_task_id = t.id) as has_children,
      ARRAY[t.name] as path
    FROM project_tasks t
    WHERE t.project_id = p_project_id 
    AND t.parent_task_id IS NULL
    
    UNION ALL
    
    -- Child tasks
    SELECT 
      t.id,
      t.name,
      t.parent_task_id,
      t.hierarchy_level,
      t.sort_order,
      EXISTS(SELECT 1 FROM project_tasks c WHERE c.parent_task_id = t.id) as has_children,
      tt.path || t.name
    FROM project_tasks t
    JOIN task_tree tt ON t.parent_task_id = tt.id
    WHERE t.project_id = p_project_id
  )
  SELECT * FROM task_tree
  ORDER BY hierarchy_level, sort_order;
END;
$function$;

-- Add RLS policies for tables missing them

-- Project assignments policies
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

-- Notifications policies  
CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Reports policies
CREATE POLICY "Users can manage reports in their workspace" 
ON public.reports 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Time tracking policies
CREATE POLICY "Users can manage time tracking in their workspace" 
ON public.time_tracking 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Baseline versions policies
CREATE POLICY "Users can manage baseline versions for their projects" 
ON public.baseline_versions 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Change control board policies
CREATE POLICY "Users can manage change control board in their workspace" 
ON public.change_control_board 
FOR ALL 
USING (
  request_id IN (
    SELECT cr.id FROM change_requests cr
    JOIN projects p ON cr.project_id = p.id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Rebaseline approvals workflow policies  
CREATE POLICY "Users can view approval workflows for their projects" 
ON public.rebaseline_approvals_workflow 
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Users can insert approval workflows" 
ON public.rebaseline_approvals_workflow 
FOR INSERT
WITH CHECK (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "Users can update approval workflows" 
ON public.rebaseline_approvals_workflow 
FOR UPDATE
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add policies for tables with RLS enabled but no policies

-- Notification queue policies
CREATE POLICY "System can manage notification queue" 
ON public.notification_queue 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Project daily checkins policies
CREATE POLICY "Users can manage daily checkins for their projects" 
ON public.project_daily_checkins 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Rebaseline approvals policies
CREATE POLICY "Users can manage rebaseline approvals for their projects" 
ON public.rebaseline_approvals 
FOR ALL 
USING (
  approval_workflow_id IN (
    SELECT raw.id FROM rebaseline_approvals_workflow raw
    JOIN projects p ON raw.project_id = p.id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Rebaseline history policies
CREATE POLICY "Users can view rebaseline history for their projects" 
ON public.rebaseline_history 
FOR SELECT
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "System can insert rebaseline history" 
ON public.rebaseline_history 
FOR INSERT
WITH CHECK (true);

-- Resource delivery confirmations policies
CREATE POLICY "Users can manage resource delivery confirmations in their workspace" 
ON public.resource_delivery_confirmations 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Tasks policies (if this is a separate table from project_tasks)
CREATE POLICY "Users can manage tasks for their projects" 
ON public.tasks 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Fix remaining functions with search paths
CREATE OR REPLACE FUNCTION public.check_circular_dependency(task_id_param uuid, new_dependency_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  visited_tasks uuid[] := ARRAY[]::uuid[];
BEGIN
  RETURN public.check_circular_dependency_recursive(task_id_param, new_dependency_id, visited_tasks);
END;
$function$;

CREATE OR REPLACE FUNCTION public.check_circular_dependency_recursive(current_task_id uuid, target_task_id uuid, visited_tasks uuid[])
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  dep_string text;
  dep_task_id uuid;
  task_dependencies text[];
BEGIN
  -- If we've reached the target task, we have a circular dependency
  IF current_task_id = target_task_id THEN
    RETURN true;
  END IF;
  
  -- If we've already visited this task, avoid infinite recursion
  IF current_task_id = ANY(visited_tasks) THEN
    RETURN false;
  END IF;
  
  -- Add current task to visited list
  visited_tasks := visited_tasks || current_task_id;
  
  -- Get dependencies of current task
  SELECT dependencies INTO task_dependencies
  FROM public.project_tasks
  WHERE id = current_task_id;
  
  -- Check each dependency recursively
  IF task_dependencies IS NOT NULL THEN
    FOREACH dep_string IN ARRAY task_dependencies LOOP
      -- Properly extract and cast UUID
      BEGIN
        dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          -- Skip invalid UUIDs
          CONTINUE;
      END;
      
      IF public.check_circular_dependency_recursive(dep_task_id, target_task_id, visited_tasks) THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  
  RETURN false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_task_dates_from_dependencies(task_id_param uuid, task_duration integer, task_dependencies text[])
 RETURNS TABLE(suggested_start_date date, suggested_end_date date, has_conflicts boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  dep_string text;
  dep_parts text[];
  dep_task_id uuid;
  dep_type text;
  dep_lag integer;
  dep_task record;
  required_start_date date;
  required_end_date date;
  latest_start_date date;
  earliest_end_date date;
  final_start_date date;
  final_end_date date;
  task_duration_days integer;
BEGIN
  -- Initialize variables
  latest_start_date := NULL;
  earliest_end_date := NULL;
  task_duration_days := COALESCE(task_duration, 1);
  
  -- If no dependencies, return NULL
  IF task_dependencies IS NULL OR array_length(task_dependencies, 1) = 0 THEN
    RETURN QUERY SELECT NULL::date, NULL::date, false;
    RETURN;
  END IF;
  
  -- Process each dependency
  FOREACH dep_string IN ARRAY task_dependencies LOOP
    -- Parse dependency string: taskId:type:lag
    dep_parts := string_to_array(dep_string, ':');
    
    IF array_length(dep_parts, 1) >= 1 THEN
      -- Properly cast text to UUID
      BEGIN
        dep_task_id := dep_parts[1]::uuid;
      EXCEPTION
        WHEN invalid_text_representation THEN
          -- Skip invalid UUIDs
          CONTINUE;
      END;
      
      dep_type := COALESCE(dep_parts[2], 'finish-to-start');
      dep_lag := COALESCE(dep_parts[3]::integer, 0);
      
      -- Get dependency task details
      SELECT start_date, end_date, duration INTO dep_task
      FROM public.project_tasks 
      WHERE id = dep_task_id;
      
      IF dep_task IS NOT NULL THEN
        -- Calculate required dates based on dependency type
        CASE dep_type
          WHEN 'finish-to-start' THEN
            required_start_date := dep_task.end_date + dep_lag + 1;
            required_end_date := required_start_date + task_duration_days - 1;
            
          WHEN 'start-to-start' THEN
            required_start_date := dep_task.start_date + dep_lag;
            required_end_date := required_start_date + task_duration_days - 1;
            
          WHEN 'finish-to-finish' THEN
            required_end_date := dep_task.end_date + dep_lag;
            required_start_date := required_end_date - task_duration_days + 1;
            
          WHEN 'start-to-finish' THEN
            required_end_date := dep_task.start_date + dep_lag;
            required_start_date := required_end_date - task_duration_days + 1;
            
          ELSE
            CONTINUE; -- Skip unknown dependency types
        END CASE;
        
        -- Track the latest required start date and earliest required end date
        IF latest_start_date IS NULL OR required_start_date > latest_start_date THEN
          latest_start_date := required_start_date;
        END IF;
        
        IF earliest_end_date IS NULL OR required_end_date < earliest_end_date THEN
          earliest_end_date := required_end_date;
        END IF;
      END IF;
    END IF;
  END LOOP;
  
  -- Determine final dates
  IF latest_start_date IS NOT NULL THEN
    final_start_date := latest_start_date;
    final_end_date := final_start_date + task_duration_days - 1;
    
    -- Check for conflicts (when finish-to-finish creates impossible schedule)
    IF earliest_end_date IS NOT NULL AND final_end_date > earliest_end_date THEN
      -- Prioritize latest start date, but flag as conflict
      RETURN QUERY SELECT final_start_date, final_end_date, true;
    ELSE
      RETURN QUERY SELECT final_start_date, final_end_date, false;
    END IF;
  ELSE
    RETURN QUERY SELECT NULL::date, NULL::date, false;
  END IF;
END;
$function$;

-- Fix remaining functions
CREATE OR REPLACE FUNCTION public.cascade_dependency_updates(updated_task_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  dependent_task record;
  calc_result record;
  dep_string text;
  dep_task_id uuid;
BEGIN
  -- Find all tasks that depend on the updated task
  FOR dependent_task IN 
    SELECT id, duration, dependencies, manual_override_dates
    FROM public.project_tasks
    WHERE dependencies IS NOT NULL
    AND (manual_override_dates IS NOT true OR manual_override_dates IS NULL)
  LOOP
    -- Check if this task depends on the updated task
    IF dependent_task.dependencies IS NOT NULL THEN
      FOREACH dep_string IN ARRAY dependent_task.dependencies LOOP
        -- Extract the task ID from the dependency string (format: taskId:type:lag)
        BEGIN
          dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
        EXCEPTION
          WHEN invalid_text_representation THEN
            -- Skip invalid UUIDs
            CONTINUE;
        END;
        
        -- If this dependency matches the updated task, recalculate dates
        IF dep_task_id = updated_task_id THEN
          -- Calculate new dates for dependent task
          SELECT * INTO calc_result
          FROM public.calculate_task_dates_from_dependencies(
            dependent_task.id,
            dependent_task.duration,
            dependent_task.dependencies
          );
          
          -- Update the dependent task if new dates are calculated
          IF calc_result.suggested_start_date IS NOT NULL THEN
            UPDATE public.project_tasks
            SET 
              start_date = calc_result.suggested_start_date,
              end_date = calc_result.suggested_end_date,
              updated_at = now()
            WHERE id = dependent_task.id;
            
            -- Recursively update tasks that depend on this one
            PERFORM public.cascade_dependency_updates(dependent_task.id);
          END IF;
          
          -- Exit the loop since we found the matching dependency
          EXIT;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_phase_dates()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  affected_phases uuid[];
BEGIN
  -- Collect all affected phase IDs based on milestone relationships
  IF TG_OP = 'DELETE' THEN
    -- For deletes, use OLD record
    IF OLD.milestone_id IS NOT NULL THEN
      SELECT ARRAY_AGG(DISTINCT m.phase_id) INTO affected_phases
      FROM milestones m
      WHERE m.id = OLD.milestone_id AND m.phase_id IS NOT NULL;
    END IF;
  ELSE
    -- For inserts/updates, use NEW record
    IF NEW.milestone_id IS NOT NULL THEN
      SELECT ARRAY_AGG(DISTINCT m.phase_id) INTO affected_phases
      FROM milestones m
      WHERE m.id = NEW.milestone_id AND m.phase_id IS NOT NULL;
    END IF;
  END IF;

  -- Update each affected phase
  IF affected_phases IS NOT NULL THEN
    UPDATE phases 
    SET 
      computed_start_date = (
        SELECT MIN(pt.start_date)
        FROM project_tasks pt
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = phases.id
        AND pt.start_date IS NOT NULL
      ),
      computed_end_date = (
        SELECT MAX(pt.end_date)
        FROM project_tasks pt  
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = phases.id
        AND pt.end_date IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = ANY(affected_phases);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_task_cascade_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Only cascade if start_date or end_date changed
  IF TG_OP = 'UPDATE' AND (OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date) THEN
    -- Use pg_notify to trigger cascade updates asynchronously to avoid deep recursion
    PERFORM pg_notify('task_updated', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_task_dependency_updates()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  calc_result record;
  dep_string text;
  dep_task_id uuid;
BEGIN
  -- Prevent infinite recursion by checking if this is a cascade update
  IF TG_OP = 'UPDATE' AND OLD.updated_at = NEW.updated_at THEN
    RETURN NEW;
  END IF;
  
  -- Validate circular dependencies on INSERT/UPDATE
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.dependencies IS DISTINCT FROM NEW.dependencies) THEN
    -- Check each new dependency for circular references
    IF NEW.dependencies IS NOT NULL THEN
      FOREACH dep_string IN ARRAY NEW.dependencies LOOP
        -- Properly extract and cast UUID
        BEGIN
          dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
        EXCEPTION
          WHEN invalid_text_representation THEN
            -- Skip invalid UUIDs
            CONTINUE;
        END;
        
        IF public.check_circular_dependency(NEW.id, dep_task_id) THEN
          RAISE EXCEPTION 'Circular dependency detected: Task % would create a dependency loop', NEW.id;
        END IF;
      END LOOP;
    END IF;
  END IF;
  
  -- Calculate and update dates based on dependencies (only if not manually overridden)
  IF (NEW.manual_override_dates IS NOT true OR NEW.manual_override_dates IS NULL) 
     AND NEW.dependencies IS NOT NULL 
     AND array_length(NEW.dependencies, 1) > 0 THEN
    
    SELECT * INTO calc_result
    FROM public.calculate_task_dates_from_dependencies(
      NEW.id,
      NEW.duration,
      NEW.dependencies
    );
    
    IF calc_result.suggested_start_date IS NOT NULL THEN
      NEW.start_date := calc_result.suggested_start_date;
      NEW.end_date := calc_result.suggested_end_date;
    END IF;
  END IF;
  
  -- Set hierarchy level and sort order (existing logic)
  IF NEW.parent_task_id IS NOT NULL THEN
    SELECT hierarchy_level + 1 INTO NEW.hierarchy_level
    FROM public.project_tasks 
    WHERE id = NEW.parent_task_id;
  ELSE
    NEW.hierarchy_level := 0;
  END IF;
  
  IF NEW.sort_order IS NULL OR NEW.sort_order = 0 THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 
    INTO NEW.sort_order
    FROM public.project_tasks 
    WHERE project_id = NEW.project_id 
    AND COALESCE(parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
        COALESCE(NEW.parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Fix remaining functions
CREATE OR REPLACE FUNCTION public.check_project_dependencies(project_id_param uuid)
 RETURNS TABLE(dependency_type text, dependency_count integer, details text)
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
BEGIN
  -- Check for active tasks
  RETURN QUERY
  SELECT 
    'tasks'::TEXT,
    COUNT(*)::INTEGER,
    'Active tasks in project'::TEXT
  FROM project_tasks 
  WHERE project_id = project_id_param 
  AND status != 'Completed'
  HAVING COUNT(*) > 0;

  -- Check for assigned resources
  RETURN QUERY
  SELECT 
    'resources'::TEXT,
    array_length(resources, 1)::INTEGER,
    'Resources assigned to project'::TEXT
  FROM projects 
  WHERE id = project_id_param 
  AND resources IS NOT NULL 
  AND array_length(resources, 1) > 0;
END;
$function$;

CREATE OR REPLACE FUNCTION public.cleanup_deleted_projects()
 RETURNS integer
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Hard delete projects that have been in recycle bin for more than 48 hours
  WITH deleted_projects AS (
    DELETE FROM public.projects 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '48 hours'
    RETURNING id, name, deleted_by
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_projects;
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (action, resource_type, metadata)
  VALUES (
    'projects_hard_deleted', 
    'cleanup', 
    jsonb_build_object('count', deleted_count, 'cleanup_date', NOW())
  );
  
  RETURN deleted_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_phase_dates_on_milestone_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path = 'public'
AS $function$
DECLARE
  old_phase_id uuid;
  new_phase_id uuid;
BEGIN
  -- Get phase IDs
  IF TG_OP = 'DELETE' THEN
    old_phase_id := OLD.phase_id;
  ELSIF TG_OP = 'INSERT' THEN
    new_phase_id := NEW.phase_id;
  ELSE -- UPDATE
    old_phase_id := OLD.phase_id;
    new_phase_id := NEW.phase_id;
  END IF;

  -- Update old phase if it exists
  IF old_phase_id IS NOT NULL THEN
    UPDATE phases 
    SET 
      computed_start_date = (
        SELECT MIN(pt.start_date)
        FROM project_tasks pt
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = old_phase_id
        AND pt.start_date IS NOT NULL
      ),
      computed_end_date = (
        SELECT MAX(pt.end_date)
        FROM project_tasks pt  
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = old_phase_id
        AND pt.end_date IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = old_phase_id;
  END IF;

  -- Update new phase if it exists and is different from old
  IF new_phase_id IS NOT NULL AND new_phase_id IS DISTINCT FROM old_phase_id THEN
    UPDATE phases 
    SET 
      computed_start_date = (
        SELECT MIN(pt.start_date)
        FROM project_tasks pt
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = new_phase_id
        AND pt.start_date IS NOT NULL
      ),
      computed_end_date = (
        SELECT MAX(pt.end_date)
        FROM project_tasks pt  
        JOIN milestones m ON pt.milestone_id = m.id
        WHERE m.phase_id = new_phase_id
        AND pt.end_date IS NOT NULL
      ),
      updated_at = NOW()
    WHERE id = new_phase_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.calculate_task_duration(task_uuid uuid)
 RETURNS integer
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  task_record RECORD;
  dependency_record RECORD;
  max_dependency_end DATE;
  task_duration INTEGER;
BEGIN
  -- Get the task record
  SELECT * INTO task_record FROM public.tasks WHERE id = task_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Find the latest end date from dependencies
  SELECT MAX(t.end_date) INTO max_dependency_end
  FROM public.tasks t
  JOIN public.task_dependencies td ON td.task_id = task_uuid
  WHERE td.depends_on_task_id = t.id;
  
  -- Calculate duration
  IF max_dependency_end IS NOT NULL THEN
    task_duration := EXTRACT(DAY FROM (task_record.end_date - GREATEST(max_dependency_end, task_record.start_date)));
  ELSE
    task_duration := EXTRACT(DAY FROM (task_record.end_date - task_record.start_date));
  END IF;
  
  RETURN GREATEST(task_duration, 0);
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_critical_path(project_uuid uuid)
 RETURNS uuid[]
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
  critical_tasks UUID[] := '{}';
  task_record RECORD;
BEGIN
  -- Simple critical path calculation (can be enhanced)
  FOR task_record IN 
    SELECT t.id
    FROM public.tasks t
    WHERE t.project_id = project_uuid
    ORDER BY t.end_date DESC, t.start_date ASC
  LOOP
    critical_tasks := array_append(critical_tasks, task_record.id);
  END LOOP;
  
  RETURN critical_tasks;
END;
$function$;
