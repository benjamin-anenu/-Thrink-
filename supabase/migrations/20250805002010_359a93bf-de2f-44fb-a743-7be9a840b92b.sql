-- First, let's check and fix the database computed date functions and triggers

-- Fix the function that updates computed dates for phases
CREATE OR REPLACE FUNCTION public.update_phase_computed_dates(phase_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  earliest_start DATE;
  latest_end DATE;
  milestone_record RECORD;
  task_dates RECORD;
BEGIN
  earliest_start := NULL;
  latest_end := NULL;
  
  -- Get all milestones in this phase
  FOR milestone_record IN 
    SELECT id FROM milestones WHERE phase_id = phase_id_param
  LOOP
    -- Get task dates for each milestone
    SELECT 
      MIN(start_date::date) as min_start,
      MAX(end_date::date) as max_end
    INTO task_dates
    FROM project_tasks 
    WHERE milestone_id = milestone_record.id
    AND start_date IS NOT NULL 
    AND end_date IS NOT NULL;
    
    IF task_dates.min_start IS NOT NULL THEN
      IF earliest_start IS NULL OR task_dates.min_start < earliest_start THEN
        earliest_start := task_dates.min_start;
      END IF;
    END IF;
    
    IF task_dates.max_end IS NOT NULL THEN
      IF latest_end IS NULL OR task_dates.max_end > latest_end THEN
        latest_end := task_dates.max_end;
      END IF;
    END IF;
  END LOOP;
  
  -- Update the phase with computed dates
  UPDATE phases 
  SET 
    computed_start_date = earliest_start,
    computed_end_date = latest_end,
    updated_at = NOW()
  WHERE id = phase_id_param;
END;
$$;

-- Fix the function that updates computed dates for projects
CREATE OR REPLACE FUNCTION public.update_project_computed_dates(project_id_param uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  earliest_start DATE;
  latest_end DATE;
BEGIN
  -- Get earliest start and latest end from phases
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
END;
$$;

-- Create improved trigger for updating phase dates when tasks change
CREATE OR REPLACE FUNCTION public.cascade_update_computed_dates()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  affected_phase_id UUID;
  affected_project_id UUID;
BEGIN
  -- Get the affected phase and project
  IF TG_OP = 'DELETE' THEN
    IF OLD.milestone_id IS NOT NULL THEN
      SELECT phase_id, project_id INTO affected_phase_id, affected_project_id
      FROM milestones 
      WHERE id = OLD.milestone_id;
    END IF;
  ELSE
    IF NEW.milestone_id IS NOT NULL THEN
      SELECT phase_id, project_id INTO affected_phase_id, affected_project_id
      FROM milestones 
      WHERE id = NEW.milestone_id;
    END IF;
  END IF;

  -- Update phase computed dates if we have a phase
  IF affected_phase_id IS NOT NULL THEN
    PERFORM public.update_phase_computed_dates(affected_phase_id);
  END IF;
  
  -- Update project computed dates if we have a project
  IF affected_project_id IS NOT NULL THEN
    PERFORM public.update_project_computed_dates(affected_project_id);
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS trigger_update_computed_dates ON project_tasks;
CREATE TRIGGER trigger_update_computed_dates
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_update_computed_dates();

-- Add computed date columns to projects table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'computed_start_date') THEN
    ALTER TABLE projects ADD COLUMN computed_start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'projects' AND column_name = 'computed_end_date') THEN
    ALTER TABLE projects ADD COLUMN computed_end_date DATE;
  END IF;
END;
$$;