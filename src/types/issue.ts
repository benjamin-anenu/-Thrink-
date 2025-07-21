
export interface ProjectIssue {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  category: 'Technical' | 'Process' | 'Client' | 'Resource' | 'Scope' | 'Communication' | 'Quality';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
  assignee_id?: string;
  linked_task_id?: string;
  linked_milestone_id?: string;
  date_identified: string;
  due_date?: string;
  source?: string;
  tags: string[];
  attachments: any[];
  impact_summary?: string;
  suggested_resolver?: string;
  suggested_action?: string;
  estimated_delay_days: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  // New computed fields
  task_name?: string;
  milestone_name?: string;
  schedule_variance_days?: number;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  comment_text: string;
  comment_type: 'comment' | 'status_change' | 'assignment_change' | 'system';
  metadata: any;
  created_at: string;
}

export interface IssueFilters {
  search: string;
  status: string[];
  severity: string[];
  priority: string[];
  category: string[];
  assignee: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
}

export interface IssueMetrics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  overdue: number;
  bySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}
