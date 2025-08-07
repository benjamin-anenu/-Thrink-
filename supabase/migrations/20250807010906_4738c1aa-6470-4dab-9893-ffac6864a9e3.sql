-- Add project_id columns to escalation tables for project-specific configurations
-- This allows both workspace-level (global) and project-specific escalation setups

-- Add project_id to escalation_levels table
ALTER TABLE public.escalation_levels 
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to escalation_triggers table  
ALTER TABLE public.escalation_triggers
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Add project_id to escalation_assignments table
ALTER TABLE public.escalation_assignments
ADD COLUMN project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_escalation_levels_project_id ON public.escalation_levels(project_id);
CREATE INDEX idx_escalation_triggers_project_id ON public.escalation_triggers(project_id);
CREATE INDEX idx_escalation_assignments_project_id ON public.escalation_assignments(project_id);

-- Create composite indexes for workspace + project queries
CREATE INDEX idx_escalation_levels_workspace_project ON public.escalation_levels(workspace_id, project_id);
CREATE INDEX idx_escalation_triggers_workspace_project ON public.escalation_triggers(workspace_id, project_id);
CREATE INDEX idx_escalation_assignments_workspace_project ON public.escalation_assignments(workspace_id, project_id);