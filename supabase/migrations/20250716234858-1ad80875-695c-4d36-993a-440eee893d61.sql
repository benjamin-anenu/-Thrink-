-- Populate the resources table with sample data
INSERT INTO resources (name, email, role, department) VALUES
('Sarah Johnson', 'sarah@company.com', 'Frontend Developer', 'Engineering'),
('Michael Chen', 'michael@company.com', 'Backend Developer', 'Engineering'),
('Emily Rodriguez', 'emily@company.com', 'UX Designer', 'Design'),
('David Kim', 'david@company.com', 'Project Manager', 'Management'),
('James Wilson', 'james@company.com', 'DevOps Engineer', 'Engineering'),
('Anna Thompson', 'anna@company.com', 'QA Engineer', 'Quality Assurance'),
('Robert Davis', 'robert@company.com', 'Business Analyst', 'Business'),
('Lisa Brown', 'lisa@company.com', 'Technical Writer', 'Documentation'),
('Kevin Zhang', 'kevin@company.com', 'Security Analyst', 'Security'),
('Maria Garcia', 'maria@company.com', 'Data Scientist', 'Analytics')
ON CONFLICT (id) DO NOTHING;

-- Add function to check task dependencies before deletion
CREATE OR REPLACE FUNCTION check_task_dependencies(task_id_param uuid)
RETURNS TABLE (
  dependent_task_id uuid,
  dependent_task_name text,
  dependency_type text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pt.id as dependent_task_id,
    pt.name as dependent_task_name,
    'blocks_task'::text as dependency_type
  FROM project_tasks pt
  WHERE task_id_param = ANY(pt.dependencies);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Improve dependency validation function to handle circular dependencies
CREATE OR REPLACE FUNCTION validate_task_dependencies()
RETURNS TRIGGER AS $$
DECLARE
  dep_task record;
  circular_check text[];
  check_id text;
BEGIN
  -- Check if task has dependencies
  IF NEW.dependencies IS NOT NULL AND array_length(NEW.dependencies, 1) > 0 THEN
    -- Initialize circular dependency check with current task
    circular_check := ARRAY[NEW.id::text];
    
    -- Check each dependency for circular references
    FOR dep_task IN 
      SELECT id, end_date, dependencies
      FROM project_tasks 
      WHERE id = ANY(NEW.dependencies)
    LOOP
      -- Check for direct circular dependency
      IF dep_task.id::text = NEW.id::text THEN
        RAISE EXCEPTION 'Circular dependency detected: Task cannot depend on itself';
      END IF;
      
      -- Check for indirect circular dependencies
      check_id := dep_task.id::text;
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
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;