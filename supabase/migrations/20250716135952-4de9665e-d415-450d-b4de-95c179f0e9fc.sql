-- Update projects RLS policies to allow proper CRUD operations for workspace members

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Allow all inserts for now" ON public.projects;

-- Create comprehensive RLS policies for projects
CREATE POLICY "Users can manage projects in their workspace" 
ON public.projects 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Ensure milestones, project_tasks, stakeholders, and resources have proper RLS policies
-- Add RLS policies for milestones
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage milestones for their projects" 
ON public.milestones 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add RLS policies for project_tasks
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tasks for their projects" 
ON public.project_tasks 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id 
    FROM public.projects p
    JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add RLS policies for stakeholders
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage stakeholders in their workspace" 
ON public.stakeholders 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id 
    FROM public.workspace_members 
    WHERE user_id = auth.uid() 
    AND status = 'active'
  )
);

-- Add RLS policies for resources  
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage all resources" 
ON public.resources 
FOR ALL 
USING (true)
WITH CHECK (true);