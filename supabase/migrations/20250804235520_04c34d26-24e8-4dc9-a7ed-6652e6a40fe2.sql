-- Create database functions for automatic date and progress calculations

-- Function to calculate milestone dates from tasks
CREATE OR REPLACE FUNCTION calculate_milestone_dates(milestone_id_param UUID)
RETURNS TABLE(computed_start_date DATE, computed_end_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MIN(pt.start_date::date) as computed_start_date,
    MAX(pt.end_date::date) as computed_end_date
  FROM project_tasks pt
  WHERE pt.milestone_id = milestone_id_param
  AND pt.start_date IS NOT NULL 
  AND pt.end_date IS NOT NULL;
END;
$$;

-- Function to calculate phase dates from milestones
CREATE OR REPLACE FUNCTION calculate_phase_dates_from_milestones(phase_id_param UUID)
RETURNS TABLE(computed_start_date DATE, computed_end_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  earliest_start DATE;
  latest_end DATE;
  milestone_record RECORD;
  milestone_dates RECORD;
BEGIN
  earliest_start := NULL;
  latest_end := NULL;
  
  -- Get all milestones in this phase
  FOR milestone_record IN 
    SELECT id FROM milestones WHERE phase_id = phase_id_param
  LOOP
    -- Calculate dates for each milestone
    SELECT * INTO milestone_dates 
    FROM calculate_milestone_dates(milestone_record.id);
    
    IF milestone_dates.computed_start_date IS NOT NULL THEN
      IF earliest_start IS NULL OR milestone_dates.computed_start_date < earliest_start THEN
        earliest_start := milestone_dates.computed_start_date;
      END IF;
    END IF;
    
    IF milestone_dates.computed_end_date IS NOT NULL THEN
      IF latest_end IS NULL OR milestone_dates.computed_end_date > latest_end THEN
        latest_end := milestone_dates.computed_end_date;
      END IF;
    END IF;
  END LOOP;
  
  RETURN QUERY SELECT earliest_start, latest_end;
END;
$$;

-- Function to calculate project dates from phases
CREATE OR REPLACE FUNCTION calculate_project_dates_from_phases(project_id_param UUID)
RETURNS TABLE(computed_start_date DATE, computed_end_date DATE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MIN(COALESCE(p.computed_start_date, p.start_date)) as computed_start_date,
    MAX(COALESCE(p.computed_end_date, p.end_date)) as computed_end_date
  FROM phases p
  WHERE p.project_id = project_id_param
  AND (p.computed_start_date IS NOT NULL OR p.start_date IS NOT NULL)
  AND (p.computed_end_date IS NOT NULL OR p.end_date IS NOT NULL);
END;
$$;

-- Function to update milestone progress from tasks
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  milestone_id_val UUID;
  total_progress NUMERIC;
  task_count INTEGER;
  calculated_progress INTEGER;
BEGIN
  -- Get the milestone ID from the affected task
  IF TG_OP = 'DELETE' THEN
    milestone_id_val := OLD.milestone_id;
  ELSE
    milestone_id_val := NEW.milestone_id;
  END IF;
  
  -- Only proceed if task has a milestone
  IF milestone_id_val IS NOT NULL THEN
    -- Calculate progress for the milestone
    SELECT 
      COUNT(*) as task_count,
      AVG(CASE 
        WHEN status = 'Completed' THEN 100 
        ELSE COALESCE(progress, 0) 
      END) as avg_progress
    INTO task_count, total_progress
    FROM project_tasks 
    WHERE milestone_id = milestone_id_val;
    
    -- Calculate final progress
    calculated_progress := COALESCE(total_progress::INTEGER, 0);
    
    -- Update milestone progress
    UPDATE milestones 
    SET progress = calculated_progress,
        updated_at = NOW()
    WHERE id = milestone_id_val;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Function to update phase progress from milestones
CREATE OR REPLACE FUNCTION update_phase_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  phase_id_val UUID;
  total_progress NUMERIC;
  milestone_count INTEGER;
  calculated_progress INTEGER;
BEGIN
  -- Get the phase ID from the affected milestone
  IF TG_OP = 'DELETE' THEN
    phase_id_val := OLD.phase_id;
  ELSE
    phase_id_val := NEW.phase_id;
  END IF;
  
  -- Only proceed if milestone has a phase
  IF phase_id_val IS NOT NULL THEN
    -- Calculate progress for the phase from its milestones
    SELECT 
      COUNT(*) as milestone_count,
      AVG(COALESCE(progress, 0)) as avg_progress
    INTO milestone_count, total_progress
    FROM milestones 
    WHERE phase_id = phase_id_val;
    
    -- Calculate final progress
    calculated_progress := COALESCE(total_progress::INTEGER, 0);
    
    -- Update phase progress and computed dates
    UPDATE phases 
    SET progress = calculated_progress,
        updated_at = NOW()
    WHERE id = phase_id_val;
    
    -- Update computed dates for the phase
    UPDATE phases 
    SET 
      computed_start_date = (SELECT computed_start_date FROM calculate_phase_dates_from_milestones(phase_id_val)),
      computed_end_date = (SELECT computed_end_date FROM calculate_phase_dates_from_milestones(phase_id_val)),
      updated_at = NOW()
    WHERE id = phase_id_val;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers for automatic updates
DROP TRIGGER IF EXISTS trigger_update_milestone_progress ON project_tasks;
CREATE TRIGGER trigger_update_milestone_progress
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_milestone_progress();

DROP TRIGGER IF EXISTS trigger_update_phase_progress ON milestones;
CREATE TRIGGER trigger_update_phase_progress
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_phase_progress();

-- Add computed date columns to milestones table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'computed_start_date') THEN
    ALTER TABLE milestones ADD COLUMN computed_start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'milestones' AND column_name = 'computed_end_date') THEN
    ALTER TABLE milestones ADD COLUMN computed_end_date DATE;
  END IF;
END
$$;

-- Add computed date columns to projects table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'computed_start_date') THEN
    ALTER TABLE projects ADD COLUMN computed_start_date DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'projects' AND column_name = 'computed_end_date') THEN
    ALTER TABLE projects ADD COLUMN computed_end_date DATE;
  END IF;
END
$$;