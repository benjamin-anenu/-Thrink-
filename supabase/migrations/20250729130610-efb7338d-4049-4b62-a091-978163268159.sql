-- Fix remaining RLS issues - enable RLS on all remaining unprotected tables
-- Check which tables still need RLS enabled

-- Enable RLS on specific tables that were flagged
ALTER TABLE public.scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholder_contact_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for scheduled_reports
CREATE POLICY "Users can manage scheduled reports in their workspace" 
ON public.scheduled_reports 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add RLS policies for stakeholder_contact_logs
CREATE POLICY "Users can manage stakeholder logs in their workspace" 
ON public.stakeholder_contact_logs 
FOR ALL 
USING (
  stakeholder_id IN (
    SELECT s.id 
    FROM stakeholders s
    JOIN workspace_members wm ON wm.workspace_id = s.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add RLS policies for stakeholders
CREATE POLICY "Users can manage stakeholders in their workspace" 
ON public.stakeholders 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add RLS policies for subscription_features
CREATE POLICY "Users can view subscription features" 
ON public.subscription_features 
FOR SELECT 
USING (true);

-- Add RLS policies for task_dependencies
CREATE POLICY "Users can manage task dependencies in their workspace" 
ON public.task_dependencies 
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

-- Add RLS policies for tasks (legacy table)
CREATE POLICY "Users can manage tasks in their workspace" 
ON public.tasks 
FOR ALL 
USING (
  project_id IN (
    SELECT p.id 
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add RLS policies for user_sessions
CREATE POLICY "Users can manage their own sessions" 
ON public.user_sessions 
FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Add RLS policies for workspace_invitations
CREATE POLICY "Users can view workspace invitations sent to them" 
ON public.workspace_invitations 
FOR SELECT 
USING (
  email IN (
    SELECT email FROM profiles WHERE user_id = auth.uid()
  ) OR
  invited_by = auth.uid() OR
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

CREATE POLICY "Workspace admins can manage invitations" 
ON public.workspace_invitations 
FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND role IN ('owner', 'admin') AND status = 'active'
  )
);

-- Add RLS policies for workspaces
CREATE POLICY "Users can view workspaces they belong to" 
ON public.workspaces 
FOR SELECT 
USING (
  id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

CREATE POLICY "Workspace owners can manage their workspaces" 
ON public.workspaces 
FOR UPDATE 
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can create workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

-- Add missing policies for tables with RLS enabled but no policies
-- change_control_board: Create proper policy based on request relationships
DROP POLICY IF EXISTS "Users can manage change control board through requests" ON public.change_control_board;
CREATE POLICY "Users can manage change control board in their workspace" 
ON public.change_control_board 
FOR ALL 
USING (
  request_id IN (
    SELECT rre.id 
    FROM rebaseline_requests_enhanced rre
    JOIN projects p ON p.id = rre.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- rebaseline_approvals_workflow: Create proper policy
DROP POLICY IF EXISTS "Users can manage rebaseline approvals through requests" ON public.rebaseline_approvals_workflow;
CREATE POLICY "Users can manage rebaseline approvals in their workspace" 
ON public.rebaseline_approvals_workflow 
FOR ALL 
USING (
  request_id IN (
    SELECT rre.id 
    FROM rebaseline_requests_enhanced rre
    JOIN projects p ON p.id = rre.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);