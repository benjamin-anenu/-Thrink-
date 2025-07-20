
-- Add soft delete columns to existing tables
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE resources 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

ALTER TABLE stakeholders 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  head_of_department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(workspace_id, name)
);

-- Create skills table (global for workspace owner)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create resource_skills junction table
CREATE TABLE IF NOT EXISTS resource_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  proficiency INTEGER CHECK (proficiency >= 1 AND proficiency <= 5),
  years_experience INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(resource_id, skill_id)
);

-- Create escalation_parameters table
CREATE TABLE IF NOT EXISTS escalation_parameters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL, -- 'delay', 'budget_overrun', 'health_score', 'milestone_miss'
  threshold_value NUMERIC,
  threshold_unit TEXT, -- 'days', 'percentage', 'amount'
  escalation_level INTEGER DEFAULT 1,
  auto_escalate BOOLEAN DEFAULT false,
  notification_template TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add skills column to project_tasks
ALTER TABLE project_tasks 
ADD COLUMN IF NOT EXISTS required_skills UUID[] DEFAULT '{}';

-- Create recycle_bin table for tracking deleted items
CREATE TABLE IF NOT EXISTS recycle_bin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'project', 'resource', 'stakeholder'
  item_id UUID NOT NULL,
  item_data JSONB NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  deleted_by UUID REFERENCES auth.users(id),
  auto_delete_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + INTERVAL '48 hours'),
  restored_at TIMESTAMP WITH TIME ZONE,
  restored_by UUID REFERENCES auth.users(id)
);

-- Update RLS policies for soft delete
DROP POLICY IF EXISTS "Users can manage active projects in their workspace" ON projects;
CREATE POLICY "Users can manage active projects in their workspace" 
ON projects FOR ALL 
USING (
  deleted_at IS NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
)
WITH CHECK (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Add policy for viewing deleted projects (for recycle bin)
CREATE POLICY "Users can view deleted projects in their workspace" 
ON projects FOR SELECT 
USING (
  deleted_at IS NOT NULL AND 
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- RLS policies for new tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage departments in their workspace" 
ON departments FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "All authenticated users can view skills" 
ON skills FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "Workspace owners can manage skills" 
ON skills FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM workspace_members wm
    JOIN workspaces w ON w.id = wm.workspace_id
    WHERE wm.user_id = auth.uid() AND w.owner_id = auth.uid()
  )
);

ALTER TABLE resource_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage resource skills in their workspace" 
ON resource_skills FOR ALL 
USING (
  resource_id IN (
    SELECT r.id FROM resources r
    JOIN workspace_members wm ON wm.workspace_id = r.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

ALTER TABLE escalation_parameters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage escalation parameters in their workspace" 
ON escalation_parameters FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

ALTER TABLE recycle_bin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage recycle bin in their workspace" 
ON recycle_bin FOR ALL 
USING (
  workspace_id IN (
    SELECT workspace_id FROM workspace_members 
    WHERE user_id = auth.uid() AND status = 'active'
  )
);

-- Function to automatically clean up recycle bin
CREATE OR REPLACE FUNCTION cleanup_recycle_bin()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Hard delete items that have passed their auto_delete_at time
  WITH deleted_items AS (
    DELETE FROM recycle_bin 
    WHERE auto_delete_at < NOW() AND restored_at IS NULL
    RETURNING *
  )
  SELECT COUNT(*) INTO deleted_count FROM deleted_items;
  
  RETURN deleted_count;
END;
$$;

-- Insert some default skills
INSERT INTO skills (name, category, description) VALUES
('React', 'Frontend Development', 'React.js framework'),
('Node.js', 'Backend Development', 'Node.js runtime'),
('Python', 'Backend Development', 'Python programming language'),
('TypeScript', 'Frontend Development', 'TypeScript language'),
('PostgreSQL', 'Database', 'PostgreSQL database'),
('Project Management', 'Management', 'Project management skills'),
('UI/UX Design', 'Design', 'User interface and experience design'),
('DevOps', 'Infrastructure', 'DevOps and infrastructure management')
ON CONFLICT (name) DO NOTHING;
