-- Fix UUID type casting issues in dependency calculation functions

-- Update the function to properly handle UUID casting
CREATE OR REPLACE FUNCTION public.calculate_task_dates_from_dependencies(task_id_param uuid, task_duration integer, task_dependencies text[])
RETURNS TABLE(suggested_start_date date, suggested_end_date date, has_conflicts boolean)
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the circular dependency check function
CREATE OR REPLACE FUNCTION public.check_circular_dependency_recursive(current_task_id uuid, target_task_id uuid, visited_tasks uuid[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Update the cascade dependency updates function
CREATE OR REPLACE FUNCTION public.cascade_dependency_updates(updated_task_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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