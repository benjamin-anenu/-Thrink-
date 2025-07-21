-- Create project_issues table
CREATE TABLE public.project_issues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Technical',
  severity TEXT NOT NULL DEFAULT 'Medium',
  priority TEXT NOT NULL DEFAULT 'Medium',
  status TEXT NOT NULL DEFAULT 'Open',
  assignee_id UUID,
  linked_task_id UUID,
  linked_milestone_id UUID,
  date_identified DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  source TEXT,
  tags TEXT[] DEFAULT '{}',
  attachments JSONB DEFAULT '[]',
  impact_summary TEXT,
  suggested_resolver TEXT,
  suggested_action TEXT,
  estimated_delay_days INTEGER DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT fk_project_issues_project FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  CONSTRAINT fk_project_issues_assignee FOREIGN KEY (assignee_id) REFERENCES public.resources(id) ON DELETE SET NULL,
  CONSTRAINT fk_project_issues_task FOREIGN KEY (linked_task_id) REFERENCES public.project_tasks(id) ON DELETE SET NULL,
  CONSTRAINT fk_project_issues_milestone FOREIGN KEY (linked_milestone_id) REFERENCES public.milestones(id) ON DELETE SET NULL,
  CONSTRAINT check_category CHECK (category IN ('Technical', 'Process', 'Client', 'Resource', 'Scope', 'Communication', 'Quality')),
  CONSTRAINT check_severity CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  CONSTRAINT check_priority CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  CONSTRAINT check_status CHECK (status IN ('Open', 'In Progress', 'Escalated', 'Resolved', 'Closed'))
);

-- Create issue_comments table for audit trail
CREATE TABLE public.issue_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL,
  user_id UUID NOT NULL,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'comment',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT fk_issue_comments_issue FOREIGN KEY (issue_id) REFERENCES public.project_issues(id) ON DELETE CASCADE,
  CONSTRAINT check_comment_type CHECK (comment_type IN ('comment', 'status_change', 'assignment_change', 'system'))
);

-- Enable Row Level Security
ALTER TABLE public.project_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issue_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for project_issues
CREATE POLICY "Users can manage issues for their projects"
ON public.project_issues
FOR ALL
USING (
  project_id IN (
    SELECT p.id
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  project_id IN (
    SELECT p.id
    FROM projects p
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create RLS policies for issue_comments
CREATE POLICY "Users can manage comments for their project issues"
ON public.issue_comments
FOR ALL
USING (
  issue_id IN (
    SELECT pi.id
    FROM project_issues pi
    JOIN projects p ON p.id = pi.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
)
WITH CHECK (
  issue_id IN (
    SELECT pi.id
    FROM project_issues pi
    JOIN projects p ON p.id = pi.project_id
    JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
    WHERE wm.user_id = auth.uid() AND wm.status = 'active'
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_project_issues_updated_at
  BEFORE UPDATE ON public.project_issues
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_project_issues_project_id ON public.project_issues(project_id);
CREATE INDEX idx_project_issues_status ON public.project_issues(status);
CREATE INDEX idx_project_issues_severity ON public.project_issues(severity);
CREATE INDEX idx_project_issues_assignee ON public.project_issues(assignee_id);
CREATE INDEX idx_project_issues_linked_task ON public.project_issues(linked_task_id);
CREATE INDEX idx_project_issues_linked_milestone ON public.project_issues(linked_milestone_id);
CREATE INDEX idx_issue_comments_issue_id ON public.issue_comments(issue_id);