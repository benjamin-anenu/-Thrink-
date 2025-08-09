export interface ActionWord {
  id: string;
  category: 'projects' | 'tasks' | 'resources' | 'stakeholders' | 'time' | 'status';
  keywords: string[];
  aliases?: string[];
  description: string;
}

export const ACTION_WORDS: ActionWord[] = [
  // Projects
  { id: 'list_projects', category: 'projects', keywords: ['projects','list','show','display'], aliases: ['all'], description: 'List projects' },
  { id: 'project_details', category: 'projects', keywords: ['details','overview','summary'], aliases: ['full','complete'], description: 'Project details' },
  { id: 'active_projects', category: 'projects', keywords: ['active','ongoing','current'], aliases: ['in progress'], description: 'Active projects' },
  { id: 'overdue_projects', category: 'projects', keywords: ['overdue','late','delayed'], aliases: ['behind schedule'], description: 'Overdue projects' },

  // Tasks
  { id: 'list_tasks', category: 'tasks', keywords: ['tasks','todos','work'], aliases: ['items'], description: 'List tasks' },
  { id: 'overdue_tasks', category: 'tasks', keywords: ['overdue','late','deadline'], aliases: ['past due'], description: 'Overdue tasks' },
  { id: 'urgent_tasks', category: 'tasks', keywords: ['urgent','critical','high'], aliases: ['priority'], description: 'High priority tasks' },

  // Resources
  { id: 'list_resources', category: 'resources', keywords: ['resources','team','members','people'], aliases: ['staff'], description: 'List resources' },
  { id: 'available_resources', category: 'resources', keywords: ['available','free','unassigned'], aliases: ['idle'], description: 'Available resources' },
  { id: 'busy_resources', category: 'resources', keywords: ['busy','assigned','working'], aliases: ['utilized'], description: 'Busy resources' },

  // Status/time helpers used as filters
  { id: 'completed', category: 'status', keywords: ['completed','done','finished'], description: 'Completed status' },
  { id: 'in_progress', category: 'status', keywords: ['in progress','ongoing','running'], description: 'In progress status' },
  { id: 'today', category: 'time', keywords: ['today','now','current'], description: 'Filter by today' },
  { id: 'this_week', category: 'time', keywords: ['this week','current week','week'], description: 'Filter by this week' },
  { id: 'this_month', category: 'time', keywords: ['this month','current month','month'], description: 'Filter by this month' },
];