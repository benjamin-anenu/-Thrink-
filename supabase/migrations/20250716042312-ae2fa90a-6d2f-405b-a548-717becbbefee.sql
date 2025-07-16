
-- First, let's update the existing projects table to match our project creation data structure
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'Medium',
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS health_status TEXT DEFAULT 'green',
ADD COLUMN IF NOT EXISTS health_score INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS team_size INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS budget TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS resources TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS stakeholder_ids UUID[] DEFAULT '{}';

-- Create project_kickoff_data table for kickoff session data
CREATE TABLE public.project_kickoff_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  meeting_minutes TEXT,
  objectives TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_requirements table
CREATE TABLE public.project_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  functional_requirements TEXT[] DEFAULT '{}',
  non_functional_requirements TEXT[] DEFAULT '{}',
  constraints TEXT[] DEFAULT '{}',
  stakeholder_signoffs BOOLEAN[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_team_members table
CREATE TABLE public.project_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  allocation INTEGER DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_escalation_matrix table
CREATE TABLE public.project_escalation_matrix (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  level INTEGER NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_role TEXT NOT NULL,
  issue_types TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_ai_data table for AI-generated content
CREATE TABLE public.project_ai_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  project_plan TEXT,
  risk_assessment TEXT,
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_initiation_documents table
CREATE TABLE public.project_initiation_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  document_content TEXT,
  signatures JSONB DEFAULT '[]',
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_files table for file attachments
CREATE TABLE public.project_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Update milestones table to include more project creation data
ALTER TABLE public.milestones 
ADD COLUMN IF NOT EXISTS baseline_date DATE,
ADD COLUMN IF NOT EXISTS progress INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS task_ids UUID[] DEFAULT '{}';

-- Update stakeholders table to match project creation structure
ALTER TABLE public.stakeholders
ADD COLUMN IF NOT EXISTS contact_info JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS escalation_level INTEGER;

-- Enable RLS on all new tables
ALTER TABLE public.project_kickoff_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_escalation_matrix ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_ai_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_initiation_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workspace-scoped access
CREATE POLICY "Users can view project kickoff data in their workspace" 
ON public.project_kickoff_data FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project kickoff data in their workspace" 
ON public.project_kickoff_data FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project requirements in their workspace" 
ON public.project_requirements FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project requirements in their workspace" 
ON public.project_requirements FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project team members in their workspace" 
ON public.project_team_members FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project team members in their workspace" 
ON public.project_team_members FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project escalation matrix in their workspace" 
ON public.project_escalation_matrix FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project escalation matrix in their workspace" 
ON public.project_escalation_matrix FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project AI data in their workspace" 
ON public.project_ai_data FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project AI data in their workspace" 
ON public.project_ai_data FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project initiation documents in their workspace" 
ON public.project_initiation_documents FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project initiation documents in their workspace" 
ON public.project_initiation_documents FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can view project files in their workspace" 
ON public.project_files FOR SELECT 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

CREATE POLICY "Users can manage project files in their workspace" 
ON public.project_files FOR ALL 
USING (project_id IN (
  SELECT p.id FROM public.projects p
  JOIN public.workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

-- Create storage bucket for project files
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', false);

-- Create storage policies for project files
CREATE POLICY "Users can view project files in their workspace" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload project files" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can update project files" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete project files" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'project-files' AND auth.uid() IS NOT NULL);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_project_kickoff_data_updated_at
  BEFORE UPDATE ON public.project_kickoff_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_requirements_updated_at
  BEFORE UPDATE ON public.project_requirements
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_ai_data_updated_at
  BEFORE UPDATE ON public.project_ai_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_initiation_documents_updated_at
  BEFORE UPDATE ON public.project_initiation_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
