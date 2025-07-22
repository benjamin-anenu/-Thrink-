-- Fix the task dependency validation trigger to handle UUID casting properly

CREATE OR REPLACE FUNCTION public.handle_task_dependency_updates()
RETURNS trigger
LANGUAGE plpgsql
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