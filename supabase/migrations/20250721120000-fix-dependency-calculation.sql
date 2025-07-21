
-- Fix dependency calculation logic to match Microsoft Project standards
CREATE OR REPLACE FUNCTION public.calculate_task_dates_from_dependencies(
  task_id_param uuid,
  task_duration integer,
  task_dependencies text[]
) RETURNS TABLE(
  suggested_start_date date,
  suggested_end_date date,
  has_conflicts boolean,
  conflict_details text[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
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
  conflicts text[] := '{}';
BEGIN
  -- Initialize variables
  latest_start_date := NULL;
  earliest_end_date := NULL;
  task_duration_days := COALESCE(task_duration, 1);
  
  -- If no dependencies, return NULL
  IF task_dependencies IS NULL OR array_length(task_dependencies, 1) = 0 THEN
    RETURN QUERY SELECT NULL::date, NULL::date, false, conflicts;
    RETURN;
  END IF;
  
  -- Process each dependency
  FOREACH dep_string IN ARRAY task_dependencies LOOP
    -- Parse dependency string: taskId:type:lag
    dep_parts := string_to_array(dep_string, ':');
    
    IF array_length(dep_parts, 1) >= 1 THEN
      dep_task_id := dep_parts[1]::uuid;
      dep_type := COALESCE(dep_parts[2], 'finish-to-start');
      dep_lag := COALESCE(dep_parts[3]::integer, 0);
      
      -- Get dependency task details
      SELECT start_date, end_date, duration, name INTO dep_task
      FROM public.project_tasks 
      WHERE id = dep_task_id;
      
      IF dep_task IS NOT NULL AND dep_task.start_date IS NOT NULL AND dep_task.end_date IS NOT NULL THEN
        -- Calculate required dates based on dependency type (Microsoft Project logic)
        CASE dep_type
          WHEN 'finish-to-start' THEN
            -- Task starts after predecessor finishes (no +1 day error)
            required_start_date := dep_task.end_date + dep_lag;
            required_end_date := required_start_date + task_duration_days - 1;
            
          WHEN 'start-to-start' THEN
            -- Task starts when predecessor starts + lag
            required_start_date := dep_task.start_date + dep_lag;
            required_end_date := required_start_date + task_duration_days - 1;
            
          WHEN 'finish-to-finish' THEN
            -- Task finishes when predecessor finishes + lag
            required_end_date := dep_task.end_date + dep_lag;
            required_start_date := required_end_date - task_duration_days + 1;
            
          WHEN 'start-to-finish' THEN
            -- Task finishes when predecessor starts + lag
            required_end_date := dep_task.start_date + dep_lag;
            required_start_date := required_end_date - task_duration_days + 1;
            
          ELSE
            -- Log unknown dependency type
            conflicts := conflicts || ('Unknown dependency type: ' || dep_type);
            CONTINUE;
        END CASE;
        
        -- Track the latest required start date
        IF latest_start_date IS NULL OR required_start_date > latest_start_date THEN
          latest_start_date := required_start_date;
        END IF;
        
        -- Track the earliest required end date for FF/SF dependencies
        IF dep_type IN ('finish-to-finish', 'start-to-finish') THEN
          IF earliest_end_date IS NULL OR required_end_date < earliest_end_date THEN
            earliest_end_date := required_end_date;
          END IF;
        END IF;
        
        -- Check for impossible scheduling (start after required end)
        IF required_start_date > required_end_date THEN
          conflicts := conflicts || ('Impossible schedule: ' || dep_task.name || ' creates negative duration');
        END IF;
        
      ELSE
        -- Log missing predecessor data
        conflicts := conflicts || ('Predecessor task not found or missing dates: ' || dep_task_id::text);
      END IF;
    END IF;
  END LOOP;
  
  -- Determine final dates
  IF latest_start_date IS NOT NULL THEN
    final_start_date := latest_start_date;
    final_end_date := final_start_date + task_duration_days - 1;
    
    -- Check for FF/SF conflicts
    IF earliest_end_date IS NOT NULL AND final_end_date > earliest_end_date THEN
      conflicts := conflicts || ('Finish-to-finish constraint violated: calculated end date exceeds required end date');
      -- Use the earliest end date to resolve conflict
      final_end_date := earliest_end_date;
      final_start_date := final_end_date - task_duration_days + 1;
    END IF;
    
    RETURN QUERY SELECT final_start_date, final_end_date, (array_length(conflicts, 1) > 0), conflicts;
  ELSE
    RETURN QUERY SELECT NULL::date, NULL::date, (array_length(conflicts, 1) > 0), conflicts;
  END IF;
END;
$$;

-- Enhanced cascade dependency updates with better conflict handling
CREATE OR REPLACE FUNCTION public.cascade_dependency_updates(
  updated_task_id uuid
) RETURNS TABLE(
  updated_task_id uuid,
  old_start_date date,
  new_start_date date,
  old_end_date date,
  new_end_date date,
  update_reason text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  dependent_task record;
  calc_result record;
  dep_string text;
  dep_task_id uuid;
  updated_count integer := 0;
  max_iterations integer := 100; -- Prevent infinite loops
BEGIN
  -- Find all tasks that depend on the updated task
  FOR dependent_task IN 
    SELECT id, duration, dependencies, manual_override_dates, start_date, end_date, name
    FROM public.project_tasks
    WHERE dependencies IS NOT NULL
    AND (manual_override_dates IS NOT true OR manual_override_dates IS NULL)
    AND id != updated_task_id
  LOOP
    -- Check if this task depends on the updated task
    IF dependent_task.dependencies IS NOT NULL THEN
      FOREACH dep_string IN ARRAY dependent_task.dependencies LOOP
        -- Extract the task ID from the dependency string
        dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
        
        -- If this dependency matches the updated task, recalculate dates
        IF dep_task_id = updated_task_id THEN
          -- Calculate new dates for dependent task
          SELECT * INTO calc_result
          FROM public.calculate_task_dates_from_dependencies(
            dependent_task.id,
            dependent_task.duration,
            dependent_task.dependencies
          );
          
          -- Update the dependent task if new dates are calculated and different
          IF calc_result.suggested_start_date IS NOT NULL AND 
             (calc_result.suggested_start_date != dependent_task.start_date OR 
              calc_result.suggested_end_date != dependent_task.end_date) THEN
            
            -- Return the update information
            RETURN QUERY SELECT 
              dependent_task.id,
              dependent_task.start_date,
              calc_result.suggested_start_date,
              dependent_task.end_date,
              calc_result.suggested_end_date,
              'Dependency cascade from task: ' || updated_task_id::text;
            
            -- Update the task
            UPDATE public.project_tasks
            SET 
              start_date = calc_result.suggested_start_date,
              end_date = calc_result.suggested_end_date,
              updated_at = now()
            WHERE id = dependent_task.id;
            
            -- Recursively update tasks that depend on this one (with limit)
            updated_count := updated_count + 1;
            IF updated_count < max_iterations THEN
              -- Recursively cascade updates
              RETURN QUERY 
              SELECT * FROM public.cascade_dependency_updates(dependent_task.id);
            END IF;
          END IF;
          
          -- Exit the loop since we found the matching dependency
          EXIT;
        END IF;
      END LOOP;
    END IF;
  END LOOP;
END;
$$;

-- Enhanced trigger for comprehensive dependency handling
CREATE OR REPLACE FUNCTION public.handle_task_dependency_updates()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  calc_result record;
  cascade_results record;
BEGIN
  -- Skip if this is a cascade update to prevent infinite loops
  IF TG_OP = 'UPDATE' AND 
     OLD.updated_at IS NOT NULL AND 
     NEW.updated_at IS NOT NULL AND 
     NEW.updated_at - OLD.updated_at < interval '1 second' THEN
    RETURN NEW;
  END IF;
  
  -- Validate circular dependencies on INSERT/UPDATE
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.dependencies IS DISTINCT FROM NEW.dependencies) THEN
    IF NEW.dependencies IS NOT NULL THEN
      DECLARE
        dep_string text;
        dep_task_id uuid;
      BEGIN
        FOREACH dep_string IN ARRAY NEW.dependencies LOOP
          dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
          
          IF public.check_circular_dependency(NEW.id, dep_task_id) THEN
            RAISE EXCEPTION 'Circular dependency detected: Task % would create a dependency loop', NEW.id;
          END IF;
        END LOOP;
      END;
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
  
  -- Set hierarchy level and sort order
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
$$;

-- Add function to get critical path
CREATE OR REPLACE FUNCTION public.get_critical_path(project_id_param uuid)
RETURNS TABLE(
  task_id uuid,
  task_name text,
  start_date date,
  end_date date,
  duration integer,
  total_float integer,
  is_critical boolean
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  task_record record;
  max_end_date date;
  critical_path_duration integer;
BEGIN
  -- Find the latest end date in the project
  SELECT MAX(end_date) INTO max_end_date
  FROM public.project_tasks
  WHERE project_id = project_id_param AND end_date IS NOT NULL;
  
  -- Calculate critical path (simplified version)
  FOR task_record IN 
    SELECT id, name, start_date, end_date, duration
    FROM public.project_tasks
    WHERE project_id = project_id_param
    AND start_date IS NOT NULL
    AND end_date IS NOT NULL
    ORDER BY end_date DESC, start_date ASC
  LOOP
    -- For now, mark tasks with zero float as critical
    -- This is a simplified algorithm - full critical path requires more complex calculations
    RETURN QUERY SELECT 
      task_record.id,
      task_record.name,
      task_record.start_date,
      task_record.end_date,
      task_record.duration,
      0 as total_float, -- Simplified - would need proper float calculation
      (task_record.end_date = max_end_date) as is_critical;
  END LOOP;
END;
$$;
