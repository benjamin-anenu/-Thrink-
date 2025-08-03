-- Migration to update project statuses based on new lifecycle logic
-- This will analyze each project's state and apply the correct status

-- Function to determine correct project status based on new lifecycle
CREATE OR REPLACE FUNCTION determine_project_status(
  p_id uuid,
  p_current_status text,
  p_ai_data_exists boolean,
  p_total_tasks integer,
  p_completed_tasks integer,
  p_assigned_tasks integer
) RETURNS text AS $$
BEGIN
  -- If project is cancelled, map to Closure
  IF p_current_status = 'Cancelled' THEN
    RETURN 'Closure';
  END IF;
  
  -- If no AI data (no project plan) and no tasks, it's still in Initiation
  IF NOT p_ai_data_exists AND p_total_tasks = 0 THEN
    RETURN 'Initiation';
  END IF;
  
  -- If has AI data but not all tasks assigned, it's in Planning
  IF p_ai_data_exists AND (p_total_tasks = 0 OR p_assigned_tasks < p_total_tasks) THEN
    RETURN 'Planning';
  END IF;
  
  -- If all tasks assigned but none completed, it's in Execution
  IF p_total_tasks > 0 AND p_assigned_tasks = p_total_tasks AND p_completed_tasks = 0 THEN
    RETURN 'Execution';
  END IF;
  
  -- If some tasks completed but not all, it's in Monitoring & Controlling
  IF p_completed_tasks > 0 AND p_completed_tasks < p_total_tasks THEN
    RETURN 'Monitoring & Controlling';
  END IF;
  
  -- If all tasks completed, it's in Closure
  IF p_total_tasks > 0 AND p_completed_tasks = p_total_tasks THEN
    RETURN 'Closure';
  END IF;
  
  -- Default fallback to current status
  RETURN p_current_status;
END;
$$ LANGUAGE plpgsql;

-- Update project statuses based on analysis
WITH project_analysis AS (
  SELECT 
    p.id,
    p.name,
    p.status as current_status,
    CASE WHEN pai.id IS NOT NULL THEN true ELSE false END as has_ai_data,
    COUNT(pt.id) as total_tasks,
    COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN 
      (pt.assigned_resources IS NOT NULL AND array_length(pt.assigned_resources, 1) > 0) OR
      (pt.assigned_stakeholders IS NOT NULL AND array_length(pt.assigned_stakeholders, 1) > 0)
    THEN 1 END) as assigned_tasks
  FROM projects p
  LEFT JOIN project_ai_data pai ON p.id = pai.project_id
  LEFT JOIN project_tasks pt ON p.id = pt.project_id
  WHERE p.deleted_at IS NULL
  GROUP BY p.id, p.name, p.status, pai.id
),
status_updates AS (
  SELECT 
    id,
    name,
    current_status,
    determine_project_status(
      id, 
      current_status,
      has_ai_data,
      total_tasks::integer,
      completed_tasks::integer,
      assigned_tasks::integer
    ) as new_status,
    total_tasks,
    completed_tasks,
    assigned_tasks,
    has_ai_data
  FROM project_analysis
)
UPDATE projects 
SET 
  status = su.new_status,
  updated_at = now()
FROM status_updates su
WHERE projects.id = su.id 
AND projects.status != su.new_status;

-- Log the status changes for audit purposes
INSERT INTO audit_logs (
  user_id,
  action,
  resource_type,
  resource_id,
  metadata
)
SELECT 
  (SELECT user_id FROM profiles LIMIT 1), -- Use first available user for system action
  'project_status_migration',
  'project',
  su.id,
  jsonb_build_object(
    'old_status', su.current_status,
    'new_status', su.new_status,
    'project_name', su.name,
    'total_tasks', su.total_tasks,
    'completed_tasks', su.completed_tasks,
    'assigned_tasks', su.assigned_tasks,
    'has_ai_data', su.has_ai_data,
    'migration_date', now()
  )
FROM (
  SELECT 
    p.id,
    p.name,
    p.status as current_status,
    CASE WHEN pai.id IS NOT NULL THEN true ELSE false END as has_ai_data,
    COUNT(pt.id) as total_tasks,
    COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN 
      (pt.assigned_resources IS NOT NULL AND array_length(pt.assigned_resources, 1) > 0) OR
      (pt.assigned_stakeholders IS NOT NULL AND array_length(pt.assigned_stakeholders, 1) > 0)
    THEN 1 END) as assigned_tasks
  FROM projects p
  LEFT JOIN project_ai_data pai ON p.id = pai.project_id
  LEFT JOIN project_tasks pt ON p.id = pt.project_id
  WHERE p.deleted_at IS NULL
  GROUP BY p.id, p.name, p.status, pai.id
) project_data
JOIN (
  SELECT 
    id,
    name,
    current_status,
    determine_project_status(
      id, 
      current_status,
      has_ai_data,
      total_tasks::integer,
      completed_tasks::integer,
      assigned_tasks::integer
    ) as new_status
  FROM (
    SELECT 
      p.id,
      p.name,
      p.status as current_status,
      CASE WHEN pai.id IS NOT NULL THEN true ELSE false END as has_ai_data,
      COUNT(pt.id) as total_tasks,
      COUNT(CASE WHEN pt.status = 'Completed' THEN 1 END) as completed_tasks,
      COUNT(CASE WHEN 
        (pt.assigned_resources IS NOT NULL AND array_length(pt.assigned_resources, 1) > 0) OR
        (pt.assigned_stakeholders IS NOT NULL AND array_length(pt.assigned_stakeholders, 1) > 0)
      THEN 1 END) as assigned_tasks
    FROM projects p
    LEFT JOIN project_ai_data pai ON p.id = pai.project_id
    LEFT JOIN project_tasks pt ON p.id = pt.project_id
    WHERE p.deleted_at IS NULL
    GROUP BY p.id, p.name, p.status, pai.id
  ) analysis
) su ON project_data.id = su.id
WHERE project_data.current_status != su.new_status;

-- Clean up the function
DROP FUNCTION determine_project_status(uuid, text, boolean, integer, integer, integer);