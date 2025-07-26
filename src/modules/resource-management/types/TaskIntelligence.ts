export interface TaskIntelligence {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  
  // Task Complexity & Effort
  complexity_score: number; // 1-10 scale (replaces estimated hours)
  effort_points: number; // Story points or similar relative sizing
  task_size: 'XS' | 'S' | 'M' | 'L' | 'XL'; // T-shirt sizing
  confidence_level: number; // How well-defined is this task (1-10)
  
  // Dependencies & Relationships
  dependency_weight: number; // How much this blocks other tasks
  prerequisite_tasks: string[]; // Must complete before starting
  parallel_task_capacity: number; // How many people can work on this simultaneously
  
  // Skill Requirements (Detailed)
  primary_skills_needed: SkillRequirement[];
  nice_to_have_skills: string[];
  learning_opportunity_skills: string[]; // Skills team members could develop
  
  // Context & Environment
  requires_deep_focus: boolean;
  collaboration_intensity: 'Low' | 'Medium' | 'High';
  context_switching_penalty: number; // Impact of interruptions (1-10)
  knowledge_transfer_required: boolean;
  
  // Auto-tracking (Task-based)
  actual_complexity: number; // Learned after completion
  completion_percentage: number;
  blocker_count: number;
  rework_cycles: number; // How many times task was reopened
  
  // Status & Timeline
  status: 'Not Started' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  assigned_resources: string[];
  
  // AI Learning Data
  estimated_completion_time: number; // AI estimated hours
  actual_completion_time?: number; // Actual time spent
  quality_score?: number; // Post-completion quality assessment
  
  // Automated Collection Fields
  git_commits: GitCommitData[];
  communication_threads: CommunicationThread[];
  help_requests: HelpRequest[];
  
  // Temporal data
  created_at: Date;
  updated_at: Date;
  started_at?: Date;
  completed_at?: Date;
}

export interface SkillRequirement {
  skill_id: string;
  skill_name: string;
  required_proficiency_level: number; // 1-10
  is_mandatory: boolean;
  alternative_skills?: string[]; // Other skills that could substitute
}

export interface GitCommitData {
  commit_hash: string;
  timestamp: Date;
  lines_added: number;
  lines_removed: number;
  files_changed: number;
  commit_message: string;
  author: string;
}

export interface CommunicationThread {
  id: string;
  platform: 'slack' | 'teams' | 'email' | 'comments';
  thread_id: string;
  message_count: number;
  participants: string[];
  started_at: Date;
  last_activity: Date;
  sentiment_score?: number; // Positive/negative sentiment analysis
}

export interface HelpRequest {
  id: string;
  requested_at: Date;
  resolved_at?: Date;
  help_type: 'technical' | 'clarification' | 'approval' | 'resource';
  resolution_time_minutes?: number;
  helped_by?: string;
}

// Enhanced Project model for AI optimization
export interface ProjectIntelligence {
  id: string;
  name: string;
  status: 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Timeline
  start_date: Date;
  target_end_date: Date;
  predicted_end_date: Date; // AI calculated
  
  // Resource Requirements (Task-based)
  required_skills: SkillRequirement[];
  required_roles: RoleRequirement[];
  estimated_total_tasks: number; // Total tasks to complete project
  average_task_complexity: number; // 1-10, affects resource allocation
  concurrent_task_limit: number; // Max tasks that can run in parallel
  
  // Auto-calculated Metrics (Task-based)
  current_task_utilization: number; // % of task capacity being used
  health_score: number; // Overall project health (1-100)
  risk_factors: RiskFactor[];
  bottleneck_tasks: string[]; // Tasks causing delays
  task_completion_rate: number; // Tasks completed vs planned per period
  
  // Team Dynamics
  team_composition: TeamMember[];
  collaboration_complexity: number; // Based on team size, skill overlap
  communication_overhead: number; // Estimated based on team structure
  
  // Workspace Integration
  workspace_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface RoleRequirement {
  role: string;
  seniority_level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  count: number;
  is_mandatory: boolean;
}

export interface RiskFactor {
  id: string;
  category: 'schedule' | 'budget' | 'resource' | 'technical' | 'external';
  description: string;
  probability: number; // 0-1
  impact: number; // 1-10
  risk_score: number;
  status: 'identified' | 'monitoring' | 'mitigating' | 'resolved';
  mitigation_actions: string[];
}

export interface TeamMember {
  resource_id: string;
  role_in_project: string;
  allocation_percentage: number;
  start_date: Date;
  end_date?: Date;
  task_capacity_allocated: number; // How many task slots allocated to this project
}

// Task performance tracking interfaces
export interface TaskCompletionPattern {
  resource_id: string;
  completion_day_of_week: string;
  completion_time_of_day: string;
  task_complexity: number;
  completion_duration_hours: number;
  quality_score: number;
  required_help_requests: number;
}

export interface TaskPerformancePrediction {
  completion_probability: number; // 0-1
  estimated_task_effort: number; // Relative effort points
  quality_prediction: number; // 1-10
  timeline_confidence: number; // 0-1
  skill_development_value: number; // Learning opportunity score
  collaboration_requirements: CollaborationRequirement[];
}

export interface CollaborationRequirement {
  collaboration_type: 'mentoring' | 'pair_programming' | 'review' | 'approval';
  required_skills: string[];
  estimated_time_percentage: number; // % of task time spent collaborating
}

// AI Analytics interfaces
export interface TaskAssignmentRecommendation {
  resource_id: string;
  
  // Task-based fit scoring
  task_capacity_fit: TaskCapacityFit;
  complexity_handling_fit: number; // 0-1 score
  task_variety_preference: number; // 0-1 score
  
  // Availability in task slots
  available_task_slots: number;
  recommended_task_assignment: TaskRecommendation[];
  
  // Performance predictions
  task_completion_forecast: number;
  quality_prediction: number;
  learning_growth_potential: number;
  
  // Team dynamics (task-based)
  collaboration_task_fit: number;
  knowledge_transfer_capacity: number;
  
  // Risk assessment
  task_overload_risk: 'Low' | 'Medium' | 'High';
  skill_gap_risks: string[];
  context_switching_impact: number;
  
  // Detailed reasoning for transparency
  reasoning: AssignmentReasoning;
}

export interface TaskCapacityFit {
  current_capacity_usage: number; // Percentage
  additional_capacity_needed: number;
  capacity_fit_score: number; // 0-1
  optimal_task_assignment_count: number;
  task_size_distribution_fit: number; // How well task sizes match preferences
}

export interface TaskRecommendation {
  task_id: string;
  fit_score: number; // 0-1
  learning_opportunity: number; // 0-1
  completion_confidence: number; // 0-1
  recommended_parallel_tasks: string[];
}

export interface AssignmentReasoning {
  task_matches: TaskMatch[];
  capacity_analysis: CapacityAnalysis;
  potential_blockers: string[];
  success_probability: number;
  alternative_task_distributions: AlternativeTaskDistribution[];
}

export interface TaskMatch {
  task_id: string;
  skill_match_score: number;
  complexity_fit_score: number;
  learning_value_score: number;
  reasoning: string;
}

export interface CapacityAnalysis {
  current_load: number;
  optimal_load_range: [number, number];
  overload_risk: string;
  recommendations: string[];
}

export interface AlternativeTaskDistribution {
  tasks: string[];
  expected_outcome: string;
  risk_level: 'Low' | 'Medium' | 'High';
  reasoning: string;
}

export interface TaskUtilizationMetrics {
  resource_id: string;
  task_count: number;
  complexity_total: number;
  capacity_used: number;
  capacity_remaining: number;
  overload_risk: 'Low' | 'Medium' | 'High';
  utilization_percentage: number;
  status: 'active' | 'inactive' | 'overloaded';
  last_updated: Date;
}