
export interface Task {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  baseline_start_date?: string;
  baseline_end_date?: string;
  progress?: number;
  assigned_resources?: string[];
  assigned_stakeholders?: string[];
  dependencies?: string[];
  priority?: 'Low' | 'Medium' | 'High' | 'Critical' | 'Normal';
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' | 'Pending';
  milestone_id?: string;
  duration?: number;
  parent_task_id?: string;
  hierarchy_level?: number;
  sort_order?: number;
  assignee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceAssignment {
  taskId: string;
  resourceId: string;
  assignedAt: string;
  role?: string;
}

export interface AssignmentSuggestion {
  taskId: string;
  taskName: string;
  suggestedResourceId: string;
  suggestedResourceName: string;
  confidence: number;
  reason: string;
  skillMatch: string[];
}
