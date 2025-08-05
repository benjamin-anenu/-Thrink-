-- Fix the project computed dates function to properly calculate from phases
CREATE OR REPLACE FUNCTION public.update_project_computed_dates(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  earliest_start DATE;
  latest_end DATE;
BEGIN
  -- Get earliest start and latest end from phases, prioritizing computed dates
  SELECT 
    MIN(COALESCE(computed_start_date, start_date)) as min_start,
    MAX(COALESCE(computed_end_date, end_date)) as max_end
  INTO earliest_start, latest_end
  FROM phases 
  WHERE project_id = project_id_param
  AND (computed_start_date IS NOT NULL OR start_date IS NOT NULL)
  AND (computed_end_date IS NOT NULL OR end_date IS NOT NULL);
  
  -- Update the project with computed dates
  UPDATE projects 
  SET 
    computed_start_date = earliest_start,
    computed_end_date = latest_end,
    updated_at = NOW()
  WHERE id = project_id_param;
  
  -- Log the update for debugging
  RAISE NOTICE 'Updated project % computed dates: start=%, end=%', project_id_param, earliest_start, latest_end;
END;
$$;

-- Recalculate the computed dates for the current project
SELECT public.update_project_computed_dates('1327ed03-c34a-406d-82ae-2cb7450afcf3');