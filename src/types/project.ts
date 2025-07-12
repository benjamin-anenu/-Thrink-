
export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  baselineStartDate: string;
  baselineEndDate: string;
  progress: number;
  assignedResources: string[];
  assignedStakeholders: string[];
  dependencies: string[];
  priority: 'High' | 'Medium' | 'Low';
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold';
  milestoneId?: string;
  parentTaskId?: string;
  duration: number; // in days
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description?: string;
  date: string;
  baselineDate: string;
  status: 'completed' | 'in-progress' | 'upcoming' | 'delayed';
  tasks: string[]; // task IDs
  progress: number;
}

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: string;
  priority: string;
  progress: number;
  health: { status: 'green' | 'yellow' | 'red'; score: number };
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
  tags: string[];
  milestones: ProjectMilestone[];
  tasks: ProjectTask[];
  resources: string[];
  stakeholders: string[];
}

export interface RebaselineRequest {
  taskId: string;
  newStartDate: string;
  newEndDate: string;
  reason: string;
  affectedTasks: string[];
}
