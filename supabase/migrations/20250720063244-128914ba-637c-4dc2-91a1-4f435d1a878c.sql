
-- Add departments table for global configuration
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on departments
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

-- Policy for departments - owners can manage, others can view
CREATE POLICY "Owners can manage departments" ON public.departments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "All authenticated users can view departments" ON public.departments
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add escalation_triggers table for global configuration
CREATE TABLE IF NOT EXISTS public.escalation_triggers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  condition_type TEXT NOT NULL,
  threshold_value INTEGER,
  threshold_unit TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on escalation_triggers
ALTER TABLE public.escalation_triggers ENABLE ROW LEVEL SECURITY;

-- Policy for escalation triggers - owners can manage, others can view
CREATE POLICY "Owners can manage escalation triggers" ON public.escalation_triggers
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'owner'
  )
);

CREATE POLICY "All authenticated users can view escalation triggers" ON public.escalation_triggers
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Add project_documents table for documentation module
CREATE TABLE IF NOT EXISTS public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  folder_name TEXT,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_documents
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;

-- Policy for project documents - workspace members can manage
CREATE POLICY "Users can manage project documents in their workspace" ON public.project_documents
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Add document_folders table for organizing documents
CREATE TABLE IF NOT EXISTS public.document_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_folder_id UUID REFERENCES public.document_folders(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, name, parent_folder_id)
);

-- Enable RLS on document_folders
ALTER TABLE public.document_folders ENABLE ROW LEVEL SECURITY;

-- Policy for document folders - workspace members can manage
CREATE POLICY "Users can manage document folders in their workspace" ON public.document_folders
FOR ALL USING (
  project_id IN (
    SELECT p.id FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Insert predefined escalation triggers
INSERT INTO public.escalation_triggers (name, description, condition_type, threshold_value, threshold_unit) VALUES
('Task Overdue', 'Trigger when a task passes its due date', 'task_overdue', 0, 'days'),
('Milestone Delayed', 'Trigger when a milestone is not completed on time', 'milestone_delayed', 0, 'days'),
('Status Blocked Too Long', 'Trigger when task status remains blocked for too long', 'status_blocked', 3, 'days'),
('No Progress Update', 'Trigger when task has no progress updates', 'no_progress_update', 7, 'days'),
('Budget Exceeded', 'Trigger when project budget is exceeded', 'budget_exceeded', 100, 'percent'),
('Resource Overallocation', 'Trigger when resource allocation exceeds capacity', 'resource_overallocation', 100, 'percent'),
('High Priority Task Delayed', 'Trigger when high priority task is delayed', 'high_priority_delayed', 1, 'days'),
('Critical Path Impacted', 'Trigger when critical path tasks are delayed', 'critical_path_delayed', 0, 'days')
ON CONFLICT DO NOTHING;

-- Add updated_at trigger for departments
CREATE OR REPLACE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for escalation_triggers
CREATE OR REPLACE TRIGGER update_escalation_triggers_updated_at
  BEFORE UPDATE ON public.escalation_triggers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for project_documents
CREATE OR REPLACE TRIGGER update_project_documents_updated_at
  BEFORE UPDATE ON public.project_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add updated_at trigger for document_folders
CREATE OR REPLACE TRIGGER update_document_folders_updated_at
  BEFORE UPDATE ON public.document_folders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add department_id to resources table if not exists
ALTER TABLE public.resources 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);

-- Add department_id to stakeholders table if not exists
ALTER TABLE public.stakeholders 
ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.departments(id);
