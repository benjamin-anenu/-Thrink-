-- Create performance profiles table
CREATE TABLE public.performance_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  resource_name TEXT NOT NULL,
  workspace_id UUID NOT NULL,
  current_score NUMERIC NOT NULL DEFAULT 0,
  monthly_score NUMERIC NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable' CHECK (trend IN ('improving', 'stable', 'declining')),
  strengths TEXT[] DEFAULT '{}',
  improvement_areas TEXT[] DEFAULT '{}',
  risk_level TEXT NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create performance metrics table
CREATE TABLE public.performance_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('task_completion', 'deadline_adherence', 'quality_score', 'collaboration', 'communication')),
  value NUMERIC NOT NULL DEFAULT 0,
  weight NUMERIC NOT NULL DEFAULT 1,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  project_id UUID,
  task_id UUID,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task deadline reminders table
CREATE TABLE public.task_deadline_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  task_name TEXT NOT NULL,
  resource_id UUID NOT NULL,
  resource_name TEXT NOT NULL,
  resource_email TEXT NOT NULL,
  project_id UUID NOT NULL,
  project_name TEXT NOT NULL,
  workspace_id UUID NOT NULL,
  deadline DATE NOT NULL,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('week_before', 'three_days', 'day_before', 'day_of', 'overdue')),
  sent BOOLEAN NOT NULL DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  response_required BOOLEAN NOT NULL DEFAULT false,
  response_received BOOLEAN DEFAULT false,
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create rebaseline requests table
CREATE TABLE public.rebaseline_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL,
  resource_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  original_deadline DATE NOT NULL,
  proposed_deadline DATE NOT NULL,
  reasons TEXT[] NOT NULL DEFAULT '{}',
  impact TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly performance reports table
CREATE TABLE public.monthly_performance_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  resource_id UUID NOT NULL,
  workspace_id UUID NOT NULL,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  overall_score NUMERIC NOT NULL DEFAULT 0,
  productivity_score NUMERIC NOT NULL DEFAULT 0,
  quality_score NUMERIC NOT NULL DEFAULT 0,
  collaboration_score NUMERIC NOT NULL DEFAULT 0,
  deadline_adherence_score NUMERIC NOT NULL DEFAULT 0,
  communication_score NUMERIC NOT NULL DEFAULT 0,
  achievements TEXT[] DEFAULT '{}',
  challenges TEXT[] DEFAULT '{}',
  goals TEXT[] DEFAULT '{}',
  ai_insights TEXT[] DEFAULT '{}',
  manager_notes TEXT,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.performance_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_deadline_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rebaseline_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_performance_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for performance profiles
CREATE POLICY "Users can view performance profiles in their workspace" 
ON public.performance_profiles 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can manage performance profiles in their workspace" 
ON public.performance_profiles 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
))
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create policies for performance metrics
CREATE POLICY "Users can view performance metrics in their workspace" 
ON public.performance_metrics 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can manage performance metrics in their workspace" 
ON public.performance_metrics 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
))
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create policies for task deadline reminders
CREATE POLICY "Users can view task deadline reminders in their workspace" 
ON public.task_deadline_reminders 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can manage task deadline reminders in their workspace" 
ON public.task_deadline_reminders 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
))
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create policies for rebaseline requests
CREATE POLICY "Users can view rebaseline requests in their workspace" 
ON public.rebaseline_requests 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can manage rebaseline requests in their workspace" 
ON public.rebaseline_requests 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
))
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create policies for monthly performance reports
CREATE POLICY "Users can view monthly performance reports in their workspace" 
ON public.monthly_performance_reports 
FOR SELECT 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

CREATE POLICY "Users can manage monthly performance reports in their workspace" 
ON public.monthly_performance_reports 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
))
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_performance_profiles_updated_at
  BEFORE UPDATE ON public.performance_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_performance_metrics_updated_at
  BEFORE UPDATE ON public.performance_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_task_deadline_reminders_updated_at
  BEFORE UPDATE ON public.task_deadline_reminders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rebaseline_requests_updated_at
  BEFORE UPDATE ON public.rebaseline_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for better performance
CREATE INDEX idx_performance_profiles_resource_workspace ON public.performance_profiles(resource_id, workspace_id);
CREATE INDEX idx_performance_metrics_resource_workspace ON public.performance_metrics(resource_id, workspace_id);
CREATE INDEX idx_task_deadline_reminders_workspace ON public.task_deadline_reminders(workspace_id);
CREATE INDEX idx_rebaseline_requests_workspace ON public.rebaseline_requests(workspace_id);
CREATE INDEX idx_monthly_performance_reports_resource_workspace ON public.monthly_performance_reports(resource_id, workspace_id);