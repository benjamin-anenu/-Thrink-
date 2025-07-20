
-- Create document_folders table (already exists, but let's ensure it has all needed columns)
ALTER TABLE document_folders 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#3b82f6';

-- Create project_documents table enhancements (already exists, add missing columns if needed)
ALTER TABLE project_documents 
ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES document_folders(id),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Update departments table to ensure it has all needed columns
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create skills table with categories
CREATE TABLE IF NOT EXISTS skills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  description TEXT,
  workspace_id UUID REFERENCES workspaces(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on skills table
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

-- Create policy for skills table
CREATE POLICY "Users can manage skills in their workspace" 
ON skills 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id 
  FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Update escalation_triggers table to include workspace_id
ALTER TABLE escalation_triggers 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id);

-- Insert predefined escalation triggers
INSERT INTO escalation_triggers (name, description, condition_type, threshold_value, threshold_unit, workspace_id)
SELECT 
  trigger_name,
  trigger_description,
  trigger_condition,
  trigger_value,
  trigger_unit,
  NULL -- Will be set per workspace
FROM (VALUES
  ('Task Overdue', 'Trigger when task is overdue by specified days', 'task_overdue', 1, 'days'),
  ('Project Budget Exceeded', 'Trigger when project budget exceeds threshold', 'budget_exceeded', 90, 'percentage'),
  ('Resource Overallocation', 'Trigger when resource allocation exceeds limit', 'resource_overallocation', 100, 'percentage'),
  ('Milestone Delay', 'Trigger when milestone is delayed', 'milestone_delay', 3, 'days'),
  ('Quality Score Low', 'Trigger when quality score falls below threshold', 'quality_score', 70, 'percentage'),
  ('Client Satisfaction Low', 'Trigger when client satisfaction is low', 'client_satisfaction', 60, 'percentage'),
  ('Team Velocity Drop', 'Trigger when team velocity drops significantly', 'velocity_drop', 20, 'percentage'),
  ('Risk Level High', 'Trigger when project risk level is high', 'risk_level', 80, 'percentage'),
  ('Communication Gap', 'Trigger when no updates for specified days', 'communication_gap', 5, 'days'),
  ('Scope Creep', 'Trigger when scope increases beyond threshold', 'scope_creep', 15, 'percentage'),
  ('Resource Unavailable', 'Trigger when key resource becomes unavailable', 'resource_unavailable', 1, 'days'),
  ('Dependency Blocking', 'Trigger when dependency blocks progress', 'dependency_blocking', 2, 'days'),
  ('Testing Failure Rate', 'Trigger when testing failure rate is high', 'testing_failure', 25, 'percentage'),
  ('Deployment Issues', 'Trigger when deployment issues occur', 'deployment_issues', 3, 'count'),
  ('Stakeholder Availability', 'Trigger when stakeholder unavailable for approvals', 'stakeholder_unavailable', 48, 'hours')
) AS triggers(trigger_name, trigger_description, trigger_condition, trigger_value, trigger_unit)
WHERE NOT EXISTS (
  SELECT 1 FROM escalation_triggers WHERE name = triggers.trigger_name
);

-- Add RLS policies for document folders and files
DROP POLICY IF EXISTS "Users can manage document folders in their workspace" ON document_folders;
CREATE POLICY "Users can manage document folders in their workspace" 
ON document_folders 
FOR ALL 
USING (project_id IN (
  SELECT p.id FROM projects p
  JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
  WHERE wm.user_id = auth.uid() AND wm.status = 'active'
));

-- Create storage bucket for project files if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-files', 'project-files', false)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for project files
CREATE POLICY "Users can upload project files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view project files in their workspace" ON storage.objects
FOR SELECT USING (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);

CREATE POLICY "Users can delete project files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'project-files' AND
  auth.uid() IS NOT NULL
);
