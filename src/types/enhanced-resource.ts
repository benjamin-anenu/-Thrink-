
export interface ResourceProfile {
  id?: string;
  resourceId: string;
  workspaceId: string;
  employeeId: string;
  seniorityLevel: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  optimalTaskCountPerDay: number;
  optimalTaskCountPerWeek: number;
  timezone?: string;
  workDays?: string[];
  preferredWorkStyle: 'Deep Focus' | 'Collaborative' | 'Mixed';
  taskSwitchingPreference: 'Sequential' | 'Parallel' | 'Batched';
  historicalTaskVelocity: number;
  complexityHandlingScore: number;
  collaborationEffectiveness: number;
  learningTaskSuccessRate: number;
  peakProductivityPeriods?: string[];
  taskSwitchingPenaltyScore?: number;
  newProjectRampUpTasks?: number;
  employmentType: 'Full-time' | 'Part-time' | 'Contract' | 'Consultant';
  contractEndDate?: string;
  plannedTimeOff?: any[];
  recurringCommitments?: any[];
  strengthKeywords: string[];
  growthAreas: string[];
  careerAspirations?: string[];
  mentorshipCapacity?: boolean;
  lastActivity?: string;
  currentProjects?: string[];
  createdAt?: string;
  updatedAt?: string;
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
  tasks_completed: number;
  status: 'Well Utilized' | 'Overloaded' | 'Underutilized' | 'Optimally Loaded' | 'Moderately Utilized' | 'Severely Overloaded';
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

// Additional types needed by various components
export interface TaskIntelligence {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  complexity_score?: number;
  effort_points?: number;
  task_size?: 'XS' | 'S' | 'M' | 'L' | 'XL';
  confidence_level?: number;
  dependency_weight?: number;
  parallel_task_capacity?: number;
  dependencies?: string[];
  required_skills?: TaskSkillRequirement[];
  requires_deep_focus?: boolean;
  collaboration_intensity?: 'Low' | 'Medium' | 'High';
  context_switching_penalty?: number;
  knowledge_transfer_required?: boolean;
  actual_complexity?: number;
  completion_percentage?: number;
  blocker_count?: number;
  rework_cycles?: number;
  status?: string;
  priority?: string;
  assignee_id?: string;
  start_date?: string;
  end_date?: string;
  completed_at?: string;
}

export interface TaskSkillRequirement {
  id: string;
  task_id: string;
  skill_id: string;
  skill_name: string;
  requirement_type: 'primary' | 'secondary' | 'nice_to_have' | 'learning_opportunity';
  minimum_proficiency: number;
  created_at: string;
}

export interface SkillProficiency {
  id: string;
  resource_id: string;
  skill_id: string;
  workspace_id: string;
  skill_name: string;
  proficiency_level: number;
  years_experience?: number;
  last_used?: string;
  confidence_score?: number;
  certification_level?: string;
  improvement_trend?: 'Improving' | 'Stable' | 'Declining';
  created_at: string;
  updated_at: string;
}

export interface TaskCapacity {
  base_capacity: number;
  skill_adjusted_capacity: number;
  complexity_capacity: {
    simple_tasks_per_period: number;
    medium_tasks_per_period: number;
    complex_tasks_per_period: number;
  };
  collaborative_capacity: number;
}

export interface TaskAvailability {
  available_task_slots: number;
  availability_percentage: number;
  simple_task_slots_available: number;
  medium_task_slots_available: number;
  complex_task_slots_available: number;
  recommended_new_tasks: number;
  context_switch_impact: number;
  next_period_availability: number;
  task_completion_forecast: number;
}

export type UtilizationStatus = 
  | 'Severely Overloaded'
  | 'Overloaded'
  | 'Optimally Loaded'
  | 'Well Utilized'
  | 'Moderately Utilized'
  | 'Underutilized';

export interface RecommendationReasoning {
  task_matches: any[];
  capacity_analysis: {
    current_utilization: number;
    additional_capacity_needed: number;
    optimal_task_distribution: string;
    timeline_impact: string;
  };
  potential_blockers: string[];
  success_factors: string[];
  risk_factors: string[];
}

export interface AlternativeAssignment {
  resource_id: string;
  fit_score: number;
  reasoning: string;
  trade_offs: string[];
}

export interface ResourceComparison {
  id: string;
  workspace_id: string;
  resource_ids: string[];
  comparison_type: string;
  skill_comparison_data: any;
  availability_comparison_data: any;
  performance_comparison_data: any;
  cost_comparison_data: any;
  complementary_skills_analysis: any;
  team_synergy_prediction: any;
  optimal_pairing_suggestions: any[];
  created_by?: string;
  updated_at?: string;
}

// Alias for backward compatibility
export type ResourceUtilizationMetrics = TaskUtilizationMetrics;
