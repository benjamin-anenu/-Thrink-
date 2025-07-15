
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  health: ProjectHealth;
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
  tags: string[];
  workspaceId: string; // Add workspace association
  resources: string[];
  stakeholders: string[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectHealth {
  status: 'red' | 'yellow' | 'green';
  score: number;
}

export interface ProjectTask {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  baselineStartDate: string;
  baselineEndDate: string;
  progress: number;
  assignedResources: string[];
  assignedStakeholders: string[];
  dependencies: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  milestoneId?: string;
  duration: number;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  date: string;
  baselineDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  tasks: string[];
  progress: number;
}

export interface RebaselineRequest {
  taskId: string;
  newStartDate: string;
  newEndDate: string;
  reason: string;
  affectedTasks: string[];
}

export interface ProjectNotification {
  id: string;
  projectId: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  category: 'task' | 'milestone' | 'resource' | 'deadline' | 'project';
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
  relatedTaskId?: string;
  relatedResourceId?: string;
}
