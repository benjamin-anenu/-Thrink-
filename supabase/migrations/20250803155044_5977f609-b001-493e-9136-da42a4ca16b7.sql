-- Migration to update project statuses based on new lifecycle logic
-- Simplified approach to avoid complex CTE issues

-- Update specific projects based on analysis
-- 1. Update "New Project" to "Monitoring & Controlling" (has completed tasks)
UPDATE projects 
SET status = 'Monitoring & Controlling', updated_at = now()
WHERE name = 'New Project' 
  AND id = '1327ed03-c34a-406d-82ae-2cb7450afcf3'
  AND EXISTS (
    SELECT 1 FROM project_tasks pt 
    WHERE pt.project_id = projects.id 
    AND pt.status = 'Completed'
  );

-- 2. Update "Guava wallet" projects to "Initiation" (no AI data, no tasks)
UPDATE projects 
SET status = 'Initiation', updated_at = now()
WHERE name LIKE '%Guava wallet%' 
  AND NOT EXISTS (
    SELECT 1 FROM project_ai_data pai 
    WHERE pai.project_id = projects.id
  )
  AND NOT EXISTS (
    SELECT 1 FROM project_tasks pt 
    WHERE pt.project_id = projects.id
  );

-- 3. Map cancelled projects to Closure
UPDATE projects 
SET status = 'Closure', updated_at = now()
WHERE status = 'Cancelled';

-- 4. Update projects with AI data but no tasks to Planning
UPDATE projects 
SET status = 'Planning', updated_at = now()
WHERE EXISTS (
  SELECT 1 FROM project_ai_data pai 
  WHERE pai.project_id = projects.id
)
AND NOT EXISTS (
  SELECT 1 FROM project_tasks pt 
  WHERE pt.project_id = projects.id
)
AND status NOT IN ('Closure', 'Cancelled');

-- Log the migration
INSERT INTO audit_logs (
  action,
  resource_type,
  metadata
)
VALUES (
  'project_status_lifecycle_migration',
  'system',
  jsonb_build_object(
    'description', 'Updated project statuses to match new lifecycle: Initiation → Planning → Execution → Monitoring & Controlling → Closure',
    'migration_date', now(),
    'affected_projects', 'New Project, Guava wallet projects, Cancelled projects'
  )
);