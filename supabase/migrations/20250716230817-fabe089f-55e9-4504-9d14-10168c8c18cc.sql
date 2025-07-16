-- Add missing fields to project_tasks table for better task management
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS milestone_id uuid,
ADD COLUMN IF NOT EXISTS baseline_start_date date,
ADD COLUMN IF NOT EXISTS baseline_end_date date,
ADD COLUMN IF NOT EXISTS duration integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS dependencies text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_resources text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS assigned_stakeholders text[] DEFAULT '{}';

-- Add foreign key for milestone
ALTER TABLE project_tasks
ADD CONSTRAINT fk_milestone_id 
FOREIGN KEY (milestone_id) REFERENCES milestones(id) ON DELETE SET NULL;

-- Create milestone management functions
CREATE OR REPLACE FUNCTION create_milestone(
  p_project_id uuid,
  p_name text,
  p_description text DEFAULT NULL,
  p_due_date date DEFAULT NULL
) RETURNS uuid AS $$
DECLARE
  milestone_id uuid;
BEGIN
  INSERT INTO milestones (project_id, name, description, due_date, baseline_date)
  VALUES (p_project_id, p_name, p_description, p_due_date, p_due_date)
  RETURNING id INTO milestone_id;
  
  RETURN milestone_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create task dependency validation function
CREATE OR REPLACE FUNCTION validate_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  dep_task record;
  dep_end_date date;
BEGIN
  -- Check if task has dependencies
  IF NEW.dependencies IS NOT NULL AND array_length(NEW.dependencies, 1) > 0 THEN
    -- Check each dependency
    FOR dep_task IN 
      SELECT id, end_date 
      FROM project_tasks 
      WHERE id = ANY(NEW.dependencies)
    LOOP
      -- If dependency end date is after this task's start date, adjust start date
      IF dep_task.end_date IS NOT NULL AND dep_task.end_date >= NEW.start_date THEN
        NEW.start_date := dep_task.end_date + INTERVAL '1 day';
        -- Recalculate end date based on duration
        IF NEW.duration IS NOT NULL THEN
          NEW.end_date := NEW.start_date + (NEW.duration - 1) * INTERVAL '1 day';
        END IF;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for dependency validation
DROP TRIGGER IF EXISTS trigger_validate_dependencies ON project_tasks;
CREATE TRIGGER trigger_validate_dependencies
  BEFORE INSERT OR UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION validate_task_dependencies();

-- Enable realtime for tables
ALTER TABLE project_tasks REPLICA IDENTITY FULL;
ALTER TABLE milestones REPLICA IDENTITY FULL;
ALTER TABLE resource_assignments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
DO $$
BEGIN
  -- Add milestones to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'milestones'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE milestones;
  END IF;
  
  -- Add project_tasks to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'project_tasks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE project_tasks;
  END IF;
  
  -- Add resource_assignments to realtime if not already added
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'resource_assignments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE resource_assignments;
  END IF;
END $$;