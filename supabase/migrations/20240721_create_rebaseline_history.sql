-- Create rebaseline_history table for enhanced rebaseline audit trail
CREATE TABLE IF NOT EXISTS rebaseline_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),
  task_id UUID REFERENCES project_tasks(id),
  rebaseline_type TEXT CHECK (rebaseline_type IN ('manual', 'auto', 'bulk')),
  reason TEXT NOT NULL,
  old_start_date DATE,
  old_end_date DATE,
  new_start_date DATE,
  new_end_date DATE,
  affected_tasks_count INTEGER,
  affected_task_ids UUID[],
  cascade_method TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rebaseline_history_project_id ON rebaseline_history(project_id);
CREATE INDEX IF NOT EXISTS idx_rebaseline_history_task_id ON rebaseline_history(task_id);
CREATE INDEX IF NOT EXISTS idx_rebaseline_history_created_at ON rebaseline_history(created_at);

-- Enable RLS
ALTER TABLE rebaseline_history ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view rebaseline history for their projects" ON rebaseline_history
  FOR SELECT USING (
    project_id IN (
      SELECT id FROM projects 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert rebaseline history for their projects" ON rebaseline_history
  FOR INSERT WITH CHECK (
    project_id IN (
      SELECT id FROM projects 
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members 
        WHERE user_id = auth.uid()
      )
    )
  ); 