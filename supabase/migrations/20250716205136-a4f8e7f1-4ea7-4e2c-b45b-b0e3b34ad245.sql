
-- Create client satisfaction tracking table
CREATE TABLE public.client_satisfaction (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  workspace_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT,
  satisfaction_score INTEGER NOT NULL CHECK (satisfaction_score >= 1 AND satisfaction_score <= 5),
  feedback_text TEXT,
  survey_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on client satisfaction
ALTER TABLE public.client_satisfaction ENABLE ROW LEVEL SECURITY;

-- Create policy for client satisfaction
CREATE POLICY "Users can manage client satisfaction in their workspace" 
  ON public.client_satisfaction 
  FOR ALL 
  USING (workspace_id IN (
    SELECT workspace_id 
    FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  ));

-- Create budget tracking table
CREATE TABLE public.project_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  budget_category TEXT NOT NULL,
  allocated_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  spent_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project budgets
ALTER TABLE public.project_budgets ENABLE ROW LEVEL SECURITY;

-- Create policy for project budgets
CREATE POLICY "Users can manage project budgets in their workspace" 
  ON public.project_budgets 
  FOR ALL 
  USING (project_id IN (
    SELECT p.id 
    FROM projects p 
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id 
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  ));

-- Add triggers for updated_at
CREATE TRIGGER update_client_satisfaction_updated_at
  BEFORE UPDATE ON public.client_satisfaction
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_budgets_updated_at
  BEFORE UPDATE ON public.project_budgets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
