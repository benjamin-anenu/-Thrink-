export interface Task {
  id: string;
  project_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  baseline_start_date: string;
  baseline_end_date: string;
  progress: number;
  assigned_resources: string[];
  assigned_stakeholders: string[];
  dependencies: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  milestone_id?: string;
  duration: number;
  parent_task_id?: string;
  hierarchy_level: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
} 