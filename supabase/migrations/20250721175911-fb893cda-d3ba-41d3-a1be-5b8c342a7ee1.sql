-- Fix RLS policies for projects table
-- Drop the overly permissive policy that allows viewing all projects
DROP POLICY IF EXISTS "Users can view projects in their workspace" ON public.projects;

-- Create a more restrictive policy that only shows active projects by default
CREATE POLICY "Users can view active projects in workspace" 
ON public.projects 
FOR SELECT 
USING (
  deleted_at IS NULL 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Create a separate policy for viewing deleted projects (only in recycle bin context)
CREATE POLICY "Users can view deleted projects for restoration" 
ON public.projects 
FOR SELECT 
USING (
  deleted_at IS NOT NULL 
  AND workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);