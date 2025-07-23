
-- Create escalation levels table
CREATE TABLE public.escalation_levels (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  level_order INTEGER NOT NULL,
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escalation assignments table to link stakeholders, triggers, and levels
CREATE TABLE public.escalation_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level_id UUID NOT NULL REFERENCES public.escalation_levels(id) ON DELETE CASCADE,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  trigger_id UUID NOT NULL REFERENCES public.escalation_triggers(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create escalation history table for tracking
CREATE TABLE public.escalation_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  trigger_id UUID NOT NULL REFERENCES public.escalation_triggers(id) ON DELETE CASCADE,
  level_id UUID NOT NULL REFERENCES public.escalation_levels(id) ON DELETE CASCADE,
  stakeholder_id UUID NOT NULL REFERENCES public.stakeholders(id) ON DELETE CASCADE,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acknowledged_at TIMESTAMP WITH TIME ZONE NULL,
  acknowledgment_token UUID DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'acknowledged', 'escalated', 'expired')),
  workspace_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for escalation levels
ALTER TABLE public.escalation_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage escalation levels in their workspace"
ON public.escalation_levels
FOR ALL
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Add RLS policies for escalation assignments
ALTER TABLE public.escalation_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage escalation assignments in their workspace"
ON public.escalation_assignments
FOR ALL
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Add RLS policies for escalation history
ALTER TABLE public.escalation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view escalation history in their workspace"
ON public.escalation_history
FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "System can insert escalation history"
ON public.escalation_history
FOR INSERT
WITH CHECK (true);

CREATE POLICY "System can update escalation history"
ON public.escalation_history
FOR UPDATE
USING (true);

-- Add indexes for performance
CREATE INDEX idx_escalation_levels_workspace_id ON public.escalation_levels(workspace_id);
CREATE INDEX idx_escalation_assignments_workspace_id ON public.escalation_assignments(workspace_id);
CREATE INDEX idx_escalation_assignments_level_id ON public.escalation_assignments(level_id);
CREATE INDEX idx_escalation_history_workspace_id ON public.escalation_history(workspace_id);
CREATE INDEX idx_escalation_history_project_id ON public.escalation_history(project_id);
CREATE INDEX idx_escalation_history_acknowledgment_token ON public.escalation_history(acknowledgment_token);

-- Add triggers for updated_at
CREATE TRIGGER update_escalation_levels_updated_at
  BEFORE UPDATE ON public.escalation_levels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalation_assignments_updated_at
  BEFORE UPDATE ON public.escalation_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escalation_history_updated_at
  BEFORE UPDATE ON public.escalation_history
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
