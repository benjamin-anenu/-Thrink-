-- Enhanced Gantt Chart and Calendar Integration Migration
-- This migration adds calendar events, task dependencies, resource assignments,
-- and external calendar integrations to support advanced Gantt functionality

-- Create calendar events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  event_type TEXT DEFAULT 'meeting', -- meeting, milestone, deadline, reminder
  location TEXT,
  attendees JSONB DEFAULT '[]',
  recurrence_rule TEXT, -- RRULE format for recurring events
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task dependencies table
CREATE TABLE IF NOT EXISTS public.task_dependencies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  dependency_type TEXT DEFAULT 'finish_to_start', -- finish_to_start, start_to_start, finish_to_finish, start_to_finish
  lag_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, depends_on_task_id)
);

-- Create task reminders table
CREATE TABLE IF NOT EXISTS public.task_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  reminder_type TEXT DEFAULT 'email', -- email, push, sms, slack
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  message TEXT,
  sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create resource assignments table
CREATE TABLE IF NOT EXISTS public.resource_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  resource_id UUID NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  allocation_percentage INTEGER DEFAULT 100,
  start_date DATE,
  end_date DATE,
  hours_per_day DECIMAL(4,2) DEFAULT 8.0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, resource_id)
);

-- Create external calendar integrations table
CREATE TABLE IF NOT EXISTS public.external_calendar_integrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- google, outlook, apple, slack
  account_email TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  sync_enabled BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_errors JSONB DEFAULT '[]',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task time tracking table
CREATE TABLE IF NOT EXISTS public.task_time_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create critical path analysis table
CREATE TABLE IF NOT EXISTS public.critical_path_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  analysis_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  critical_path_tasks UUID[] DEFAULT '{}',
  total_duration_days INTEGER,
  slack_days INTEGER,
  analysis_data JSONB,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_workspace_date 
ON public.calendar_events(workspace_id, start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_calendar_events_project 
ON public.calendar_events(project_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_task 
ON public.task_dependencies(task_id);

CREATE INDEX IF NOT EXISTS idx_task_dependencies_depends_on 
ON public.task_dependencies(depends_on_task_id);

CREATE INDEX IF NOT EXISTS idx_task_reminders_task_time 
ON public.task_reminders(task_id, reminder_time);

CREATE INDEX IF NOT EXISTS idx_task_reminders_sent 
ON public.task_reminders(sent);

CREATE INDEX IF NOT EXISTS idx_resource_assignments_task 
ON public.resource_assignments(task_id);

CREATE INDEX IF NOT EXISTS idx_resource_assignments_resource 
ON public.resource_assignments(resource_id);

CREATE INDEX IF NOT EXISTS idx_external_calendar_workspace 
ON public.external_calendar_integrations(workspace_id);

CREATE INDEX IF NOT EXISTS idx_task_time_tracking_task_user 
ON public.task_time_tracking(task_id, user_id);

CREATE INDEX IF NOT EXISTS idx_critical_path_analysis_project 
ON public.critical_path_analysis(project_id);

-- Enable Row Level Security
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_calendar_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_time_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.critical_path_analysis ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspace-scoped access
CREATE POLICY "Users can view calendar events in their workspace" 
ON public.calendar_events FOR SELECT 
USING (workspace_id IN (
  SELECT wm.workspace_id FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage calendar events in their workspace" 
ON public.calendar_events FOR ALL 
USING (workspace_id IN (
  SELECT wm.workspace_id FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view task dependencies in their workspace" 
ON public.task_dependencies FOR SELECT 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage task dependencies in their workspace" 
ON public.task_dependencies FOR ALL 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view task reminders in their workspace" 
ON public.task_reminders FOR SELECT 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage task reminders in their workspace" 
ON public.task_reminders FOR ALL 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view resource assignments in their workspace" 
ON public.resource_assignments FOR SELECT 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage resource assignments in their workspace" 
ON public.resource_assignments FOR ALL 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view external calendar integrations in their workspace" 
ON public.external_calendar_integrations FOR SELECT 
USING (workspace_id IN (
  SELECT wm.workspace_id FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage external calendar integrations in their workspace" 
ON public.external_calendar_integrations FOR ALL 
USING (workspace_id IN (
  SELECT wm.workspace_id FROM public.workspace_members wm
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view task time tracking in their workspace" 
ON public.task_time_tracking FOR SELECT 
USING (task_id IN (
  SELECT t.id FROM public.tasks t
  JOIN public.projects p ON p.id = t.project_id
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage their own task time tracking" 
ON public.task_time_tracking FOR ALL 
USING (user_id = auth.uid());

CREATE POLICY "Users can view critical path analysis in their workspace" 
ON public.critical_path_analysis FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage critical path analysis in their workspace" 
ON public.critical_path_analysis FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_resource_assignments_updated_at
  BEFORE UPDATE ON public.resource_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_external_calendar_integrations_updated_at
  BEFORE UPDATE ON public.external_calendar_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate task duration based on dependencies
CREATE OR REPLACE FUNCTION public.calculate_task_duration(task_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  task_record RECORD;
  dependency_record RECORD;
  max_dependency_end DATE;
  task_duration INTEGER;
BEGIN
  -- Get the task record
  SELECT * INTO task_record FROM public.tasks WHERE id = task_uuid;
  
  IF NOT FOUND THEN
    RETURN 0;
  END IF;
  
  -- Find the latest end date from dependencies
  SELECT MAX(t.end_date) INTO max_dependency_end
  FROM public.tasks t
  JOIN public.task_dependencies td ON td.task_id = task_uuid
  WHERE td.depends_on_task_id = t.id;
  
  -- Calculate duration
  IF max_dependency_end IS NOT NULL THEN
    task_duration := EXTRACT(DAY FROM (task_record.end_date - GREATEST(max_dependency_end, task_record.start_date)));
  ELSE
    task_duration := EXTRACT(DAY FROM (task_record.end_date - task_record.start_date));
  END IF;
  
  RETURN GREATEST(task_duration, 0);
END;
$$;

-- Create function to get critical path for a project
CREATE OR REPLACE FUNCTION public.get_critical_path(project_uuid UUID)
RETURNS UUID[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
AS $$
DECLARE
  critical_tasks UUID[] := '{}';
  task_record RECORD;
BEGIN
  -- Simple critical path calculation (can be enhanced)
  FOR task_record IN 
    SELECT t.id
    FROM public.tasks t
    WHERE t.project_id = project_uuid
    ORDER BY t.end_date DESC, t.start_date ASC
  LOOP
    critical_tasks := array_append(critical_tasks, task_record.id);
  END LOOP;
  
  RETURN critical_tasks;
END;
$$; 