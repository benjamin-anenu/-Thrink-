-- Add computed date columns to phases table
ALTER TABLE public.phases 
ADD COLUMN IF NOT EXISTS computed_start_date DATE,
ADD COLUMN IF NOT EXISTS computed_end_date DATE;

-- Function to recalculate phase dates when tasks change
CREATE OR REPLACE FUNCTION public.update_phase_dates()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for task changes
DROP TRIGGER IF EXISTS update_phase_dates_on_task_change ON project_tasks;
CREATE TRIGGER update_phase_dates_on_task_change
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_phase_dates();

-- Function to recalculate phase dates when milestones are moved between phases
CREATE OR REPLACE FUNCTION public.update_phase_dates_on_milestone_change()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for milestone phase changes
DROP TRIGGER IF EXISTS update_phase_dates_on_milestone_change ON milestones;
CREATE TRIGGER update_phase_dates_on_milestone_change
  AFTER INSERT OR UPDATE OR DELETE ON milestones
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_phase_dates_on_milestone_change();

-- Initial calculation for existing phases
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
WHERE id IN (
  SELECT DISTINCT phase_id 
  FROM milestones 
  WHERE phase_id IS NOT NULL
);