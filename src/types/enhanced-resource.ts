export interface ResourceProfile {
  resourceId: string;
  workspaceId: string;
  employeeId: string;
  seniorityLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead';
  optimalTaskCountPerDay: number;
  optimalTaskCountPerWeek: number;
  preferredWorkStyle: 'Deep Focus' | 'Collaborative' | 'Mixed';
  taskSwitchingPreference: 'Sequential' | 'Parallel';
  historicalTaskVelocity: number;
  complexityHandlingScore: number;
  collaborationEffectiveness: number;
  learningTaskSuccessRate: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract';
  strengthKeywords: string[];
  growthAreas: string[];
}

export interface TaskUtilizationMetrics {
  task_count: number;
  task_capacity: number;
  utilization_percentage: number;
  weighted_task_load: number;
  weighted_capacity: number;
  weighted_utilization: number;
  simple_tasks: number;
  medium_tasks: number;
  complex_tasks: number;
  tasks_completed: number; // Added this missing property
  status: 'Well Utilized' | 'Overloaded' | 'Underutilized';
  utilization_trend: number;
  optimal_task_range: [number, number];
  predicted_completion_count: number;
  bottleneck_risk: number;
  context_switch_penalty: number;
}

export interface AIAssignmentRecommendation {
  id: string;
  project_id: string;
  resource_id: string;
  workspace_id: string;
  task_capacity_fit_score: number;
  complexity_handling_fit_score: number;
  skill_match_score: number;
  availability_score: number;
  collaboration_fit_score: number;
  learning_opportunity_score: number;
  overall_fit_score: number;
  task_completion_forecast: number;
  quality_prediction: number;
  timeline_confidence: number;
  success_probability: number;
  overload_risk_score: number;
  skill_gap_risk_score: number;
  context_switching_impact: number;
  recommended_task_count: number;
  reasoning: any;
  alternative_assignments: any;
  created_at: string;
  expires_at: string;
}
