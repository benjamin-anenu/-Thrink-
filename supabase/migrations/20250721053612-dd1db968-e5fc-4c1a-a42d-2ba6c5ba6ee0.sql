
-- Add missing columns to departments table
ALTER TABLE departments 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to skills table  
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General',
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add missing columns to escalation_triggers table
ALTER TABLE escalation_triggers 
ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id);

-- Update RLS policies for departments table
DROP POLICY IF EXISTS "All authenticated users can view departments" ON departments;
DROP POLICY IF EXISTS "Owners can manage departments" ON departments;

CREATE POLICY "Users can manage departments in their workspace" 
ON departments 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id 
  FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Update RLS policies for skills table
DROP POLICY IF EXISTS "Allow read access to all skills" ON skills;

CREATE POLICY "Users can manage skills in their workspace" 
ON skills 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id 
  FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Update RLS policies for escalation_triggers table
DROP POLICY IF EXISTS "All authenticated users can view escalation triggers" ON escalation_triggers;
DROP POLICY IF EXISTS "Owners can manage escalation triggers" ON escalation_triggers;

CREATE POLICY "Users can manage escalation triggers in their workspace" 
ON escalation_triggers 
FOR ALL 
USING (workspace_id IN (
  SELECT workspace_id 
  FROM workspace_members 
  WHERE user_id = auth.uid() AND status = 'active'
));

-- Create triggers to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger for skills table
DROP TRIGGER IF EXISTS update_skills_updated_at ON skills;
CREATE TRIGGER update_skills_updated_at
    BEFORE UPDATE ON skills
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for departments table  
DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
    BEFORE UPDATE ON departments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add trigger for escalation_triggers table
DROP TRIGGER IF EXISTS update_escalation_triggers_updated_at ON escalation_triggers;
CREATE TRIGGER update_escalation_triggers_updated_at
    BEFORE UPDATE ON escalation_triggers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
