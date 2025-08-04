// Project Status Lifecycle Enum
export const ProjectStatus = {
  INITIATION: 'Initiation',
  PLANNING: 'Planning',
  EXECUTION: 'Execution',
  MONITORING_CONTROLLING: 'Monitoring & Controlling',
  CLOSURE: 'Closure'
} as const;

export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];

// Legacy status mapping for backward compatibility
export type LegacyProjectStatus = 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';

// Status transitions configuration
export const statusTransitions: Record<ProjectStatusType, ProjectStatusType[]> = {
  [ProjectStatus.INITIATION]: [ProjectStatus.PLANNING],
  [ProjectStatus.PLANNING]: [ProjectStatus.EXECUTION, ProjectStatus.INITIATION],
  [ProjectStatus.EXECUTION]: [ProjectStatus.MONITORING_CONTROLLING, ProjectStatus.PLANNING],
  [ProjectStatus.MONITORING_CONTROLLING]: [ProjectStatus.EXECUTION, ProjectStatus.CLOSURE],
  [ProjectStatus.CLOSURE]: [] // Final state
};

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: ProjectStatusType | LegacyProjectStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  health: ProjectHealth;
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
  tags: string[];
  workspaceId: string;
  resources: string[];
  stakeholders: string[];
  phases?: ProjectPhase[]; // New field for enhanced hierarchy
  milestones: ProjectMilestone[]; // Kept for backward compatibility
  tasks: ProjectTask[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  // Enhanced AI metadata
  aiGenerated?: {
    projectPlan?: string;
    riskAssessment?: string;
    recommendations?: string[];
  };
  aiInsights?: AIProjectInsight[];
  riskProfile?: RiskProfile;
  aiRecommendations?: AIRecommendation[];
  lastAIAnalysis?: string;
  aiProcessingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  aiProcessingStartedAt?: string;
  aiProcessingCompletedAt?: string;
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
  // New hierarchy fields
  parentTaskId?: string;
  hierarchyLevel: number;
  sortOrder: number;
  hasChildren?: boolean;
  children?: ProjectTask[];
  // New dependency management fields
  manualOverrideDates?: boolean;
}

export interface ProjectPhase {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  baselineStartDate?: string;
  baselineEndDate?: string;
  status: PhaseStatus;
  priority: Priority;
  progress: number;
  sortOrder: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  
  // Computed/derived fields
  milestones?: ProjectMilestone[];
  taskCount?: number;
  completedTaskCount?: number;
  duration?: number; // in days
  isOverdue?: boolean;
  health?: ProjectHealth;
}

export type PhaseStatus = 'planned' | 'active' | 'completed' | 'paused' | 'cancelled';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  date: string;
  baselineDate: string;
  status: 'upcoming' | 'in-progress' | 'completed' | 'overdue';
  tasks: string[];
  progress: number;
  phaseId?: string; // New field - nullable for backward compatibility
  sortOrderInPhase?: number; // New field for ordering within phase
  
  // Computed fields
  phase?: ProjectPhase; // Reference to parent phase
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

// New AI-related interfaces
export interface AIProjectInsight {
  id: string;
  projectId: string;
  type: 'prediction' | 'optimization' | 'risk' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  category: 'timeline' | 'budget' | 'resources' | 'quality' | 'scope';
  recommendations: string[];
  createdAt: Date;
  expiresAt?: Date;
  status: 'active' | 'resolved' | 'dismissed';
  metadata?: Record<string, any>;
}

export interface RiskProfile {
  projectId: string;
  overallRiskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  lastUpdated: Date;
  trends: RiskTrend[];
}

export interface RiskFactor {
  id: string;
  category: 'schedule' | 'budget' | 'resource' | 'technical' | 'external';
  description: string;
  probability: number;
  impact: number;
  riskScore: number;
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved';
  mitigationActions: string[];
}

export interface RiskTrend {
  date: Date;
  riskScore: number;
  changeReason: string;
}

export interface AIRecommendation {
  id: string;
  projectId: string;
  type: 'task_prioritization' | 'resource_allocation' | 'timeline_adjustment' | 'budget_optimization' | 'quality_improvement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'implemented' | 'dismissed';
  createdAt: Date;
  implementedAt?: Date;
  results?: string;
  relatedInsightId?: string;
}

// New hierarchy-related interfaces
export interface TaskHierarchyNode {
  task: ProjectTask;
  children: TaskHierarchyNode[];
  depth: number;
  isExpanded: boolean;
  path: string[];
}

export interface TaskHierarchyOperations {
  promoteTask: (taskId: string) => Promise<void>;
  demoteTask: (taskId: string, newParentId?: string) => Promise<void>;
  moveTask: (taskId: string, newParentId?: string, newPosition?: number) => Promise<void>;
  reorderTasks: (taskIds: string[], newParentId?: string) => Promise<void>;
}

export interface TaskHierarchyState {
  hierarchyTree: TaskHierarchyNode[];
  expandedNodes: Set<string>;
  selectedTasks: Set<string>;
}

// Project Status Logic Functions
export interface ProjectStatusLogic {
  determineProjectStatus: (project: ProjectData) => ProjectStatusType;
  isActiveProject: (project: ProjectData) => boolean;
  canTransitionTo: (currentStatus: ProjectStatusType, targetStatus: ProjectStatusType) => boolean;
  getAvailableTransitions: (currentStatus: ProjectStatusType) => ProjectStatusType[];
  updateProjectStatus: (projectId: string, event: ProjectEvent) => Promise<void>;
}

// Project Events for Status Transitions
export type ProjectEvent = 
  | 'wizard_completed'
  | 'project_plan_created'
  | 'all_tasks_assigned'
  | 'first_task_completed'
  | 'all_tasks_completed'
  | 'admin_override';

export interface ProjectEventPayload {
  projectId: string;
  event: ProjectEvent;
  metadata?: Record<string, any>;
  adminOverrideStatus?: ProjectStatusType;
}

// Status Logic Helper Functions
export function determineProjectStatus(project: ProjectData): ProjectStatusType {
  // Check if project has AI-generated plan (wizard completed)
  const hasProjectPlan = project.aiGenerated?.projectPlan && project.aiGenerated.projectPlan.length > 0;
  
  // Check if all tasks are assigned
  const allTasksAssigned = project.tasks.length > 0 && 
    project.tasks.every(task => task.assignedResources.length > 0 || task.assignedStakeholders.length > 0);
  
  // Calculate task completion stats
  const completedTaskCount = project.tasks.filter(task => task.status === 'Completed').length;
  const totalTaskCount = project.tasks.length;
  
  // Status determination logic - Enhanced to handle manual projects
  if (!hasProjectPlan && totalTaskCount === 0) return ProjectStatus.INITIATION;
  if (!hasProjectPlan && totalTaskCount > 0) {
    // Manual project with tasks - determine status based on task completion
    if (completedTaskCount === 0) return ProjectStatus.EXECUTION;
    if (completedTaskCount < totalTaskCount) return ProjectStatus.MONITORING_CONTROLLING;
    return ProjectStatus.CLOSURE;
  }
  if (!allTasksAssigned || totalTaskCount === 0) return ProjectStatus.PLANNING;
  if (completedTaskCount === 0) return ProjectStatus.EXECUTION;
  if (completedTaskCount < totalTaskCount) return ProjectStatus.MONITORING_CONTROLLING;
  return ProjectStatus.CLOSURE;
}

export function isActiveProject(project: ProjectData): boolean {
  const currentStatus = typeof project.status === 'string' && project.status in ProjectStatus 
    ? project.status as ProjectStatusType 
    : determineProjectStatus(project);
  
  return currentStatus !== ProjectStatus.CLOSURE;
}

export function canTransitionTo(currentStatus: ProjectStatusType, targetStatus: ProjectStatusType): boolean {
  return statusTransitions[currentStatus]?.includes(targetStatus) || false;
}

export function getAvailableTransitions(currentStatus: ProjectStatusType): ProjectStatusType[] {
  return statusTransitions[currentStatus] || [];
}

export function getCompletedTaskCount(project: ProjectData): number {
  return project.tasks.filter(task => task.status === 'Completed').length;
}

export function getTotalTaskCount(project: ProjectData): number {
  return project.tasks.length;
}

export function allTasksAssigned(project: ProjectData): boolean {
  return project.tasks.length > 0 && 
    project.tasks.every(task => task.assignedResources.length > 0 || task.assignedStakeholders.length > 0);
}

// Legacy status mapping for backward compatibility
export function mapLegacyStatus(legacyStatus: LegacyProjectStatus): ProjectStatusType {
  switch (legacyStatus) {
    case 'Planning': return ProjectStatus.PLANNING;
    case 'In Progress': return ProjectStatus.EXECUTION;
    case 'On Hold': return ProjectStatus.EXECUTION; // Treat as execution with issues
    case 'Completed': return ProjectStatus.CLOSURE;
    case 'Cancelled': return ProjectStatus.CLOSURE; // Final state
    default: return ProjectStatus.INITIATION;
  }
}

export function mapToLegacyStatus(status: ProjectStatusType): LegacyProjectStatus {
  switch (status) {
    case ProjectStatus.INITIATION: return 'Planning';
    case ProjectStatus.PLANNING: return 'Planning';
    case ProjectStatus.EXECUTION: return 'In Progress';
    case ProjectStatus.MONITORING_CONTROLLING: return 'In Progress';
    case ProjectStatus.CLOSURE: return 'Completed';
    default: return 'Planning';
  }
}
