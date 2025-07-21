
-- Fix the validate_task_dependencies trigger function to handle UUID casting properly
CREATE OR REPLACE FUNCTION public.validate_task_dependencies()
RETURNS trigger
LANGUAGE plpgsql
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
