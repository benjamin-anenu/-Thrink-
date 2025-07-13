
export interface PerformanceMetric {
  id: string;
  resourceId: string;
  type: 'task_completion' | 'deadline_adherence' | 'quality_score' | 'collaboration' | 'communication';
  value: number;
  weight: number;
  timestamp: Date;
  projectId?: string;
  taskId?: string;
  description: string;
}

export interface PerformanceProfile {
  resourceId: string;
  resourceName: string;
  currentScore: number;
  monthlyScore: number;
  trend: 'improving' | 'stable' | 'declining';
  metrics: PerformanceMetric[];
  strengths: string[];
  improvementAreas: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: Date;
  monthlyReports: MonthlyPerformanceReport[];
}

export interface MonthlyPerformanceReport {
  id: string;
  resourceId: string;
  month: string;
  year: number;
  overallScore: number;
  categories: {
    productivity: number;
    quality: number;
    collaboration: number;
    deadlineAdherence: number;
    communication: number;
  };
  achievements: string[];
  challenges: string[];
  goals: string[];
  aiInsights: string[];
  managerNotes?: string;
  generatedAt: Date;
}

export interface TaskDeadlineReminder {
  id: string;
  taskId: string;
  taskName: string;
  resourceId: string;
  resourceName: string;
  resourceEmail: string;
  projectId: string;
  projectName: string;
  deadline: Date;
  reminderType: 'week_before' | 'three_days' | 'day_before' | 'day_of' | 'overdue';
  sent: boolean;
  sentAt?: Date;
  responseRequired: boolean;
  responseReceived?: boolean;
  responseData?: {
    onTrack: boolean;
    confidence: number;
    needsRebaseline: boolean;
    reasons?: string[];
    newEstimate?: Date;
  };
}

export interface RebaselineRequest {
  id: string;
  taskId: string;
  resourceId: string;
  originalDeadline: Date;
  proposedDeadline: Date;
  reasons: string[];
  impact: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewNotes?: string;
}
