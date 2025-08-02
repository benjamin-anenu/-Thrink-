
-- Add trigger to keep milestone task_ids array in sync with task milestone_id references
CREATE OR REPLACE FUNCTION sync_milestone_task_ids()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT: add task to milestone's task_ids array
  IF TG_OP = 'INSERT' AND NEW.milestone_id IS NOT NULL THEN
    UPDATE milestones 
    SET task_ids = COALESCE(task_ids, '{}') || ARRAY[NEW.id]
    WHERE id = NEW.milestone_id
    AND NOT (NEW.id = ANY(COALESCE(task_ids, '{}')));
    
  -- Handle UPDATE: manage milestone changes
  ELSIF TG_OP = 'UPDATE' THEN
    -- If milestone_id changed from one to another
    IF OLD.milestone_id IS DISTINCT FROM NEW.milestone_id THEN
      -- Remove from old milestone
      IF OLD.milestone_id IS NOT NULL THEN
        UPDATE milestones 
        SET task_ids = array_remove(COALESCE(task_ids, '{}'), OLD.id)
        WHERE id = OLD.milestone_id;
      END IF;
      
      -- Add to new milestone
      IF NEW.milestone_id IS NOT NULL THEN
        UPDATE milestones 
        SET task_ids = COALESCE(task_ids, '{}') || ARRAY[NEW.id]
        WHERE id = NEW.milestone_id
        AND NOT (NEW.id = ANY(COALESCE(task_ids, '{}')));
      END IF;
    END IF;
    
  -- Handle DELETE: remove task from milestone
  ELSIF TG_OP = 'DELETE' AND OLD.milestone_id IS NOT NULL THEN
    UPDATE milestones 
    SET task_ids = array_remove(COALESCE(task_ids, '{}'), OLD.id)
    WHERE id = OLD.milestone_id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for milestone task sync
DROP TRIGGER IF EXISTS sync_milestone_tasks_trigger ON project_tasks;
CREATE TRIGGER sync_milestone_tasks_trigger
  AFTER INSERT OR UPDATE OR DELETE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION sync_milestone_task_ids();

-- Update existing milestone task_ids to be in sync
UPDATE milestones SET task_ids = (
  SELECT COALESCE(array_agg(pt.id), '{}')
  FROM project_tasks pt 
  WHERE pt.milestone_id = milestones.id
);

-- Enhanced function to calculate milestone progress based on actual task data
CREATE OR REPLACE FUNCTION calculate_milestone_progress(milestone_id_param uuid)
RETURNS integer AS $$
DECLARE
  total_tasks integer;
  completed_tasks integer;
  avg_progress numeric;
BEGIN
  -- Count tasks and their completion status
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'Completed'),
    AVG(COALESCE(progress, 0))
  INTO total_tasks, completed_tasks, avg_progress
  FROM project_tasks 
  WHERE milestone_id = milestone_id_param;
  
  -- If no tasks, return 0
  IF total_tasks = 0 THEN
    RETURN 0;
  END IF;
  
  -- Use average progress as milestone progress
  RETURN COALESCE(avg_progress::integer, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get milestone date range from tasks
CREATE OR REPLACE FUNCTION get_milestone_date_range(milestone_id_param uuid)
RETURNS TABLE(start_date date, end_date date) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MIN(pt.start_date::date) as start_date,
    MAX(pt.end_date::date) as end_date
  FROM project_tasks pt
  WHERE pt.milestone_id = milestone_id_param
  AND pt.start_date IS NOT NULL 
  AND pt.end_date IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get project date range from phases
CREATE OR REPLACE FUNCTION get_project_phase_date_range(project_id_param uuid)
RETURNS TABLE(start_date date, end_date date) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    MIN(COALESCE(p.computed_start_date, p.start_date)) as start_date,
    MAX(COALESCE(p.computed_end_date, p.end_date)) as end_date
  FROM phases p
  WHERE p.project_id = project_id_param
  ORDER BY p.sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
