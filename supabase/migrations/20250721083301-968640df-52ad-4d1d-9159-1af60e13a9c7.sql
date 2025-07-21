
-- Update RLS policy for escalation_triggers to allow viewing all triggers
DROP POLICY IF EXISTS "Users can manage escalation triggers in their workspace" ON escalation_triggers;

-- Create new policies that allow viewing all triggers but only managing workspace-assigned ones
CREATE POLICY "Users can view all escalation triggers" ON escalation_triggers
FOR SELECT USING (true);

CREATE POLICY "Users can update escalation triggers in their workspace" ON escalation_triggers
FOR UPDATE USING (
  workspace_id IN (
    SELECT workspace_members.workspace_id
    FROM workspace_members
    WHERE workspace_members.user_id = auth.uid() 
    AND workspace_members.status = 'active'
  ) OR workspace_id IS NULL
);

CREATE POLICY "Users can insert escalation triggers in their workspace" ON escalation_triggers
FOR INSERT WITH CHECK (
  workspace_id IN (
    SELECT workspace_members.workspace_id
    FROM workspace_members
    WHERE workspace_members.user_id = auth.uid() 
    AND workspace_members.status = 'active'
  )
);
