
-- Add hierarchy support columns to project_tasks table
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS parent_task_id uuid REFERENCES project_tasks(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS hierarchy_level integer DEFAULT 0 CHECK (hierarchy_level >= 0 AND hierarchy_level <= 5),
ADD COLUMN IF NOT EXISTS sort_order integer DEFAULT 0;

-- Create index for better performance on hierarchy queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_hierarchy 
ON project_tasks(project_id, parent_task_id, sort_order);

-- Create index for efficient hierarchy level queries
CREATE INDEX IF NOT EXISTS idx_project_tasks_level 
ON project_tasks(project_id, hierarchy_level, sort_order);

-- Update the dependency validation trigger to handle hierarchy
CREATE OR REPLACE FUNCTION validate_task_hierarchy()
RETURNS TRIGGER AS $$
DECLARE
  max_depth INTEGER := 5;
  current_depth INTEGER := 0;
  check_parent_id UUID;
BEGIN
  -- If parent_task_id is set, validate hierarchy depth
  IF NEW.parent_task_id IS NOT NULL THEN
    -- Check for circular references
    check_parent_id := NEW.parent_task_id;
    current_depth := 1;
    
    WHILE check_parent_id IS NOT NULL AND current_depth <= max_depth LOOP
      -- Check if we've created a circular reference
      IF check_parent_id = NEW.id THEN
        RAISE EXCEPTION 'Circular reference detected in task hierarchy';
      END IF;
      
      -- Get the parent's parent
      SELECT parent_task_id INTO check_parent_id 
      FROM project_tasks 
      WHERE id = check_parent_id;
      
      current_depth := current_depth + 1;
    END LOOP;
    
    -- Check if we exceeded max depth
    IF current_depth > max_depth THEN
      RAISE EXCEPTION 'Task hierarchy depth cannot exceed % levels', max_depth;
    END IF;
    
    -- Set hierarchy level based on parent
    SELECT hierarchy_level + 1 INTO NEW.hierarchy_level
    FROM project_tasks 
    WHERE id = NEW.parent_task_id;
    
    -- Ensure parent task is in the same project
    IF NOT EXISTS (
      SELECT 1 FROM project_tasks 
      WHERE id = NEW.parent_task_id 
      AND project_id = NEW.project_id
    ) THEN
      RAISE EXCEPTION 'Parent task must be in the same project';
    END IF;
  ELSE
    -- Root level task
    NEW.hierarchy_level := 0;
  END IF;
  
  -- Set default sort_order if not specified
  IF NEW.sort_order IS NULL OR NEW.sort_order = 0 THEN
    SELECT COALESCE(MAX(sort_order), 0) + 1 
    INTO NEW.sort_order
    FROM project_tasks 
    WHERE project_id = NEW.project_id 
    AND COALESCE(parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid) = 
        COALESCE(NEW.parent_task_id, '00000000-0000-0000-0000-000000000000'::uuid);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for hierarchy validation
DROP TRIGGER IF EXISTS trigger_validate_task_hierarchy ON project_tasks;
CREATE TRIGGER trigger_validate_task_hierarchy
  BEFORE INSERT OR UPDATE ON project_tasks
  FOR EACH ROW EXECUTE FUNCTION validate_task_hierarchy();

-- Function to get task hierarchy tree for a project
CREATE OR REPLACE FUNCTION get_task_hierarchy(p_project_id uuid)
RETURNS TABLE(
  id uuid,
  name text,
  parent_task_id uuid,
  hierarchy_level integer,
  sort_order integer,
  has_children boolean,
  path text[]
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE task_tree AS (
    -- Root tasks (no parent)
    SELECT 
      t.id,
      t.name,
      t.parent_task_id,
      t.hierarchy_level,
      t.sort_order,
      EXISTS(SELECT 1 FROM project_tasks c WHERE c.parent_task_id = t.id) as has_children,
      ARRAY[t.name] as path
    FROM project_tasks t
    WHERE t.project_id = p_project_id 
    AND t.parent_task_id IS NULL
    
    UNION ALL
    
    -- Child tasks
    SELECT 
      t.id,
      t.name,
      t.parent_task_id,
      t.hierarchy_level,
      t.sort_order,
      EXISTS(SELECT 1 FROM project_tasks c WHERE c.parent_task_id = t.id) as has_children,
      tt.path || t.name
    FROM project_tasks t
    JOIN task_tree tt ON t.parent_task_id = tt.id
    WHERE t.project_id = p_project_id
  )
  SELECT * FROM task_tree
  ORDER BY hierarchy_level, sort_order;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
