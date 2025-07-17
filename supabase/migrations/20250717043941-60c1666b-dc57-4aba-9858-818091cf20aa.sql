
-- Add soft delete columns to projects table
ALTER TABLE public.projects 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN deleted_by UUID REFERENCES auth.users(id);

-- Update RLS policies to exclude soft-deleted projects by default
DROP POLICY IF EXISTS "Users can view projects in their workspace" ON public.projects;
DROP POLICY IF EXISTS "Users can manage projects in their workspace" ON public.projects;

CREATE POLICY "Users can view active projects in their workspace" 
  ON public.projects 
  FOR SELECT 
  USING (
    deleted_at IS NULL AND
    EXISTS (
      SELECT 1 FROM workspace_members 
      WHERE workspace_members.workspace_id = projects.workspace_id 
      AND workspace_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage active projects in their workspace" 
  ON public.projects 
  FOR ALL 
  USING (
    deleted_at IS NULL AND
    workspace_id IN (
      SELECT workspace_members.workspace_id
      FROM workspace_members
      WHERE workspace_members.user_id = auth.uid() 
      AND workspace_members.status = 'active'
    )
  )
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_members.workspace_id
      FROM workspace_members
      WHERE workspace_members.user_id = auth.uid() 
      AND workspace_members.status = 'active'
    )
  );

-- Create policy for accessing deleted projects (recycle bin)
CREATE POLICY "Users can view deleted projects in their workspace" 
  ON public.projects 
  FOR SELECT 
  USING (
    deleted_at IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_members.workspace_id
      FROM workspace_members
      WHERE workspace_members.user_id = auth.uid() 
      AND workspace_members.status = 'active'
    )
  );

-- Create policy for restoring deleted projects
CREATE POLICY "Users can restore deleted projects in their workspace" 
  ON public.projects 
  FOR UPDATE 
  USING (
    deleted_at IS NOT NULL AND
    workspace_id IN (
      SELECT workspace_members.workspace_id
      FROM workspace_members
      WHERE workspace_members.user_id = auth.uid() 
      AND workspace_members.status = 'active'
    )
  );

-- Function to check for project dependencies before deletion
CREATE OR REPLACE FUNCTION check_project_dependencies(project_id_param UUID)
RETURNS TABLE(
  dependency_type TEXT,
  dependency_count INTEGER,
  details TEXT
) LANGUAGE plpgsql AS $$
BEGIN
  -- Check for active tasks
  RETURN QUERY
  SELECT 
    'tasks'::TEXT,
    COUNT(*)::INTEGER,
    'Active tasks in project'::TEXT
  FROM project_tasks 
  WHERE project_id = project_id_param 
  AND status != 'Completed'
  HAVING COUNT(*) > 0;

  -- Check for assigned resources
  RETURN QUERY
  SELECT 
    'resources'::TEXT,
    array_length(resources, 1)::INTEGER,
    'Resources assigned to project'::TEXT
  FROM projects 
  WHERE id = project_id_param 
  AND resources IS NOT NULL 
  AND array_length(resources, 1) > 0;
END;
$$;

-- Function to cleanup old deleted projects (for cron job)
CREATE OR REPLACE FUNCTION cleanup_deleted_projects()
RETURNS INTEGER LANGUAGE plpgsql AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Hard delete projects that have been in recycle bin for more than 48 hours
  WITH deleted_projects AS (
    DELETE FROM public.projects 
    WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '48 hours'
    RETURNING id, name, deleted_by
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_projects;
  
  -- Log the cleanup
  INSERT INTO public.audit_logs (action, resource_type, metadata)
  VALUES (
    'projects_hard_deleted', 
    'cleanup', 
    jsonb_build_object('count', deleted_count, 'cleanup_date', NOW())
  );
  
  RETURN deleted_count;
END;
$$;
