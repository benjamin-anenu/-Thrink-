// Enhanced Resource Management Types
// Support for AI-powered resource management with task-based utilization

export interface ResourceProfile {
  // Identity & Role
  id: string;
  resource_id: string;
  workspace_id: string;
  employee_id?: string;
  seniority_level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  
  // Task Handling Patterns
  optimal_task_count_per_day: number;
  optimal_task_count_per_week: number;
  timezone: string;
  work_days: string[];
  preferred_work_style: 'Deep Focus' | 'Collaborative' | 'Mixed';
  task_switching_preference: 'Sequential' | 'Parallel' | 'Batched';
  
  // Performance Metrics (Auto-calculated)
  historical_task_velocity: number;
  complexity_handling_score: number; // 1-10 scale
  collaboration_effectiveness: number;
  learning_task_success_rate: number;
  
  // Task Productivity Patterns
  peak_productivity_periods: string[];
  task_switching_penalty_score: number; // 1-10 scale
  new_project_ramp_up_tasks: number;
  
  // Contract & Availability
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Consultant';
  contract_end_date?: string;
  planned_time_off: DateRange[];
  recurring_commitments: RecurringCommitment[];
  
  // AI Enhancement Data
  strength_keywords: string[];
  growth_areas: string[];
  career_aspirations: string[];
  mentorship_capacity: boolean;
  
  // Status tracking
  last_activity: string;
  current_projects: string[];
  
  created_at: string;
  updated_at: string;
}

export interface SkillProficiency {
  id: string;
  resource_id: string;
  skill_id: string;
  workspace_id: string;
  skill_name: string; // Populated from join
  proficiency_level: number; // 1-10 scale
  years_experience: number;
  last_used: string;
  confidence_score: number; // 1-10 scale
  certification_level?: string;
  improvement_trend: 'Improving' | 'Stable' | 'Declining';
  created_at: string;
  updated_at: string;
}

export interface TaskIntelligence {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  
  // Task Complexity & Effort
  complexity_score: number; // 1-10 scale
  effort_points: number;
  task_size: 'XS' | 'S' | 'M' | 'L' | 'XL';
  confidence_level: number; // 1-10 scale
  
  // Dependencies & Relationships
  dependency_weight: number;
  parallel_task_capacity: number;
  dependencies: string[];
  
  // Skill Requirements
  required_skills: TaskSkillRequirement[];
  
  // Context & Environment
  requires_deep_focus: boolean;
  collaboration_intensity: 'Low' | 'Medium' | 'High';
  context_switching_penalty: number; // 1-10 scale
  knowledge_transfer_required: boolean;
  
  // Auto-tracking
  actual_complexity?: number;
  completion_percentage?: number;
  blocker_count: number;
  rework_cycles: number;
  
  // Standard task fields
  status: string;
  priority: string;
  assignee_id?: string;
  start_date?: string;
  end_date?: string;
  completed_at?: string;
}

export interface TaskSkillRequirement {
  id: string;
  task_id: string;
  skill_id: string;
  skill_name: string; // Populated from join
  requirement_type: 'primary' | 'secondary' | 'nice_to_have' | 'learning_opportunity';
  minimum_proficiency: number; // 1-10 scale
  created_at: string;
}

export interface ResourceUtilizationMetrics {
  id: string;
  resource_id: string;
  workspace_id: string;
  
  // Period
  period_start: string;
  period_end: string;
  period_type: 'day' | 'week' | 'month';
  
  // Task-based metrics
  task_count: number;
  task_capacity: number;
  utilization_percentage: number;
  weighted_task_load: number;
  weighted_capacity: number;
  weighted_utilization: number;
  
  // Task distribution
  simple_tasks: number;
  medium_tasks: number;
  complex_tasks: number;
  
  // Performance indicators
  tasks_completed: number;
  average_task_quality: number;
  collaboration_tasks: number;
  learning_tasks: number;
  
  // Status and trends
  utilization_status: string;
  context_switch_penalty: number;
  bottleneck_risk_score: number; // 0-10 scale
  
  created_at: string;
  updated_at: string;
}

export interface AIAssignmentRecommendation {
  id: string;
  project_id: string;
  resource_id: string;
  workspace_id: string;
  
  // Scoring metrics
  task_capacity_fit_score: number;
  complexity_handling_fit_score: number;
  skill_match_score: number;
  availability_score: number;
  collaboration_fit_score: number;
  learning_opportunity_score: number;
  overall_fit_score: number;
  
  // Predictions
  task_completion_forecast: number;
  quality_prediction: number;
  timeline_confidence: number;
  success_probability: number;
  
  // Risk assessment
  overload_risk_score: number; // 0-10 scale
  skill_gap_risk_score: number; // 0-10 scale
  context_switching_impact: number;
  
  // Recommendation data
  recommended_task_count: number;
  reasoning: RecommendationReasoning;
  alternative_assignments: AlternativeAssignment[];
  
  created_at: string;
  expires_at: string;
}

export interface ResourceComparison {
  id: string;
  workspace_id: string;
  resource_ids: string[];
  comparison_type: string;
  
  // Comparison metrics
  skill_comparison_data: SkillComparisonData;
  availability_comparison_data: AvailabilityComparisonData;
  performance_comparison_data: PerformanceComparisonData;
  cost_comparison_data: CostComparisonData;
  
  // AI analysis
  complementary_skills_analysis: ComplementarySkillsAnalysis;
  team_synergy_prediction: TeamSynergyPrediction;
  optimal_pairing_suggestions: OptimalPairingSuggestion[];
  
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Supporting interfaces
export interface DateRange {
  start_date: string;
  end_date: string;
  description?: string;
}

export interface RecurringCommitment {
  title: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
}

export interface RecommendationReasoning {
  task_matches: TaskMatch[];
  capacity_analysis: CapacityAnalysis;
  potential_blockers: string[];
  success_factors: string[];
  risk_factors: string[];
}

export interface TaskMatch {
  task_id: string;
  task_name: string;
  fit_score: number;
  reasoning: string;
  learning_opportunity: boolean;
}

export interface CapacityAnalysis {
  current_utilization: number;
  additional_capacity_needed: number;
  optimal_task_distribution: string;
  timeline_impact: string;
}

export interface AlternativeAssignment {
  resource_id: string;
  resource_name: string;
  fit_score: number;
  reasoning: string;
  trade_offs: string[];
}

export interface SkillComparisonData {
  [skillName: string]: {
    resource_proficiencies: { [resourceId: string]: number };
    skill_demand_score: number;
    improvement_opportunities: string[];
  };
}

export interface AvailabilityComparisonData {
  [resourceId: string]: {
    current_utilization: number;
    available_capacity: number;
    upcoming_availability: DateRange[];
    peak_productivity_times: string[];
  };
}

export interface PerformanceComparisonData {
  [resourceId: string]: {
    task_completion_rate: number;
    average_task_quality: number;
    collaboration_effectiveness: number;
    learning_adaptability: number;
    complexity_handling: number;
  };
}

export interface CostComparisonData {
  [resourceId: string]: {
    hourly_rate?: number;
    productivity_score: number;
    value_ratio: number;
    total_cost_estimate: number;
  };
}

export interface ComplementarySkillsAnalysis {
  skill_coverage: { [skillName: string]: number };
  skill_gaps: string[];
  redundant_skills: string[];
  learning_opportunities: string[];
}

export interface TeamSynergyPrediction {
  collaboration_score: number;
  communication_efficiency: number;
  knowledge_transfer_potential: number;
  conflict_risk_score: number;
  overall_team_effectiveness: number;
}

export interface OptimalPairingSuggestion {
  resource_combination: string[];
  synergy_score: number;
  reasoning: string;
  expected_outcomes: string[];
  potential_challenges: string[];
}

// Utilization calculation types
export interface TaskCapacity {
  base_capacity: number;
  skill_adjusted_capacity: number;
  complexity_capacity: ComplexityCapacity;
  collaborative_capacity: number;
}

export interface ComplexityCapacity {
  simple_tasks_per_period: number;
  medium_tasks_per_period: number;
  complex_tasks_per_period: number;
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
  status: UtilizationStatus;
  utilization_trend: number;
  optimal_task_range: [number, number];
  predicted_completion_count: number;
  bottleneck_risk: number;
  context_switch_penalty: number;
}