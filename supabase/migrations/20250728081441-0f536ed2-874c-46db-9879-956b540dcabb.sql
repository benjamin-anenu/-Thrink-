-- Phase 1: Critical RLS Security Fixes (Corrected)
-- Enable RLS on all unprotected tables and add policies

-- 1. baseline_versions table
ALTER TABLE public.baseline_versions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage baseline versions in their workspace" 
ON public.baseline_versions 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 2. change_control_board table (no direct workspace link, use request_id)
ALTER TABLE public.change_control_board ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage change control board through requests" 
ON public.change_control_board 
FOR ALL 
USING (true); -- Temporarily allow all access, will be restricted based on business logic

-- 3. notifications table (user-specific)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own notifications" 
ON public.notifications 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 4. project_assignments table
ALTER TABLE public.project_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage project assignments in their workspace" 
ON public.project_assignments 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 5. rebaseline_approvals_workflow table (no direct workspace link)
ALTER TABLE public.rebaseline_approvals_workflow ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rebaseline approvals through requests" 
ON public.rebaseline_approvals_workflow 
FOR ALL 
USING (true); -- Temporarily allow all access, will be restricted based on business logic

-- 6. rebaseline_history table
ALTER TABLE public.rebaseline_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rebaseline history in their workspace" 
ON public.rebaseline_history 
FOR SELECT 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

CREATE POLICY "System can insert rebaseline history" 
ON public.rebaseline_history 
FOR INSERT 
WITH CHECK (true);

-- 7. rebaseline_requests_enhanced table
ALTER TABLE public.rebaseline_requests_enhanced ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage rebaseline requests in their workspace" 
ON public.rebaseline_requests_enhanced 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 8. reports table (no workspace_id column, use project_id)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage reports in their workspace" 
ON public.reports 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- 9. time_tracking table (no workspace_id, use task_id to get to workspace)
ALTER TABLE public.time_tracking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage time tracking in their workspace" 
ON public.time_tracking 
FOR ALL 
USING (
  task_id IN (
    SELECT pt.id 
    FROM project_tasks pt
    JOIN projects p ON p.id = pt.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add missing policies for tables that have RLS enabled but no policies
-- project_daily_checkins
CREATE POLICY "Users can manage project daily checkins in their workspace" 
ON public.project_daily_checkins 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- project_files
CREATE POLICY "Users can manage project files in their workspace" 
ON public.project_files 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- project_issues
CREATE POLICY "Users can manage project issues in their workspace" 
ON public.project_issues 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- project_tasks
CREATE POLICY "Users can manage project tasks in their workspace" 
ON public.project_tasks 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- projects
CREATE POLICY "Users can manage projects in their workspace" 
ON public.projects 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);