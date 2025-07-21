-- Add manual override column for tasks
ALTER TABLE public.project_tasks 
ADD COLUMN IF NOT EXISTS manual_override_dates boolean DEFAULT false;

-- Create enhanced dependency calculation function
CREATE OR REPLACE FUNCTION public.calculate_task_dates_from_dependencies(
  task_id_param uuid,
  task_duration integer,
  task_dependencies text[]
) RETURNS TABLE(
  suggested_start_date date,
  suggested_end_date date,
  has_conflicts boolean
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
      dep_task_id := dep_parts[1]::uuid;
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
$$;

-- Function to check for circular dependencies
CREATE OR REPLACE FUNCTION public.check_circular_dependency(
  task_id_param uuid,
  new_dependency_id uuid
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  visited_tasks uuid[] := ARRAY[]::uuid[];
BEGIN
  RETURN public.check_circular_dependency_recursive(task_id_param, new_dependency_id, visited_tasks);
END;
$$;

-- Recursive helper function for circular dependency check
CREATE OR REPLACE FUNCTION public.check_circular_dependency_recursive(
  current_task_id uuid,
  target_task_id uuid,
  visited_tasks uuid[]
) RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER AS $$
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
      dep_task_id := (string_to_array(dep_string, ':'))[1]::uuid;
      
      IF public.check_circular_dependency_recursive(dep_task_id, target_task_id, visited_tasks) THEN
        RETURN true;
      END IF;
    END LOOP;
  END IF;
  
  RETURN false;
END;
$$;

-- Function to cascade dependency updates
CREATE OR REPLACE FUNCTION public.cascade_dependency_updates(
  updated_task_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  dependent_task record;
  calc_result record;
BEGIN
  -- Find all tasks that depend on the updated task
  FOR dependent_task IN 
    SELECT id, duration, dependencies, manual_override_dates
    FROM public.project_tasks
    WHERE updated_task_id::text = ANY(
      SELECT unnest(string_to_array(unnest(dependencies), ':')) 
      FROM public.project_tasks 
      WHERE id != updated_task_id
    )
    AND (manual_override_dates IS NOT true OR manual_override_dates IS NULL)
  LOOP
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
  END LOOP;
END;
$$;

-- Enhanced trigger for task updates with dependency calculation
CREATE OR REPLACE FUNCTION public.handle_task_dependency_updates()
RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  calc_result record;
BEGIN
  -- Prevent infinite recursion by checking if this is a cascade update
  IF TG_OP = 'UPDATE' AND OLD.updated_at = NEW.updated_at THEN
    RETURN NEW;
  END IF;
  
  -- Validate circular dependencies on INSERT/UPDATE
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND OLD.dependencies != NEW.dependencies) THEN
    -- Check each new dependency for circular references
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
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS task_dependency_updates_trigger ON public.project_tasks;
CREATE TRIGGER task_dependency_updates_trigger
  BEFORE INSERT OR UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_dependency_updates();

-- Trigger for cascading updates after a task is updated
CREATE OR REPLACE FUNCTION public.handle_task_cascade_updates()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  -- Only cascade if start_date or end_date changed
  IF TG_OP = 'UPDATE' AND (OLD.start_date != NEW.start_date OR OLD.end_date != NEW.end_date) THEN
    -- Use pg_notify to trigger cascade updates asynchronously to avoid deep recursion
    PERFORM pg_notify('task_updated', NEW.id::text);
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_cascade_updates_trigger ON public.project_tasks;
CREATE TRIGGER task_cascade_updates_trigger
  AFTER UPDATE ON public.project_tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_task_cascade_updates();