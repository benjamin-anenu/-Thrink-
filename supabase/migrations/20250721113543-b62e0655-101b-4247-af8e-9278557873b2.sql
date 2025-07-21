
-- Fix the cascade dependency updates function to handle UUID comparisons properly
CREATE OR REPLACE FUNCTION public.cascade_dependency_updates(
  updated_task_id uuid
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
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
$$;
