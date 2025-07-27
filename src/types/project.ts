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
  workspaceId: string;
  resources: string[];
  stakeholders: string[];
  phases?: ProjectPhase[]; // New field for enhanced hierarchy
  milestones: ProjectMilestone[]; // Kept for backward compatibility
  tasks: ProjectTask[];
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  completedAt?: string;
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
