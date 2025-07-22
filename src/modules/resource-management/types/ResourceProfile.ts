export interface ResourceProfile {
  // Identity & Role
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department_id: string; // Links to workspace settings
  role: string;
  seniority_level: 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal';
  
  // Skills & Competencies (Auto-synced from workspace settings)
  primary_skills: SkillProficiency[];
  secondary_skills: SkillProficiency[];
  learning_skills: string[]; // Skills currently being developed
  
  // Task Handling Patterns (For AI Predictions)
  optimal_task_count_per_day: number; // e.g., 2-3 tasks per day
  optimal_task_count_per_week: number; // e.g., 8-12 tasks per week
  timezone: string;
  work_days: string[]; // ['Monday', 'Tuesday', ...]
  preferred_work_style: 'Deep Focus' | 'Collaborative' | 'Mixed';
  task_switching_preference: 'Sequential' | 'Parallel' | 'Batched';
  
  // Performance Metrics (Auto-calculated from task completion)
  historical_task_velocity: number; // Tasks completed per week (rolling average)
  complexity_handling_score: number; // 1-10 scale based on task difficulty completed
  collaboration_effectiveness: number; // Success rate on multi-person tasks
  learning_task_success_rate: number; // Success rate when learning new skills
  
  // Task Productivity Patterns (AI Learning Data)
  peak_productivity_periods: string[]; // ['Monday-AM', 'Wednesday-PM']
  task_switching_penalty_score: number; // How much performance drops (1-10)
  new_project_ramp_up_tasks: number; // Tasks needed to become productive
  optimal_task_complexity_mix: ComplexityMix; // Preferred ratio of simple:medium:complex
  
  // Contract & Availability
  employment_type: 'Full-time' | 'Part-time' | 'Contract' | 'Consultant';
  contract_end_date?: Date;
  planned_time_off: DateRange[];
  recurring_commitments: RecurringCommitment[]; // Meetings, training, etc.
  
  // AI Enhancement Data
  strength_keywords: string[]; // Extracted from performance reviews, feedback
  growth_areas: string[];
  career_aspirations: string[];
  mentorship_capacity: boolean;
  
  // Automated Tracking Fields
  current_projects: string[];
  last_activity: Date;
  status: 'Available' | 'Busy' | 'Overloaded' | 'On Leave' | 'Transitioning';
  
  // Workspace Integration
  workspace_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface SkillProficiency {
  skill_id: string;
  skill_name: string; // Synced from workspace settings
  proficiency_level: number; // 1-10 scale
  years_experience: number;
  last_used: Date;
  confidence_score: number; // Self-assessed + validated through task completion
  certification_level?: string;
  improvement_trend: 'Improving' | 'Stable' | 'Declining';
}

export interface ComplexityMix {
  simple_tasks_percentage: number; // 1-3 complexity
  medium_tasks_percentage: number; // 4-6 complexity
  complex_tasks_percentage: number; // 7-10 complexity
}

export interface DateRange {
  start_date: Date;
  end_date: Date;
  description?: string;
}

export interface RecurringCommitment {
  id: string;
  title: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  task_capacity_impact: number; // How many task slots this blocks
}

// Task-based utilization metrics
export interface TaskUtilizationMetrics {
  // Core Metrics
  task_count: number;
  task_capacity: number;
  utilization_percentage: number;
  
  // Weighted Utilization (considers task complexity)
  weighted_task_load: number;
  weighted_capacity: number;
  weighted_utilization: number;
  
  // Task Distribution
  simple_tasks: number;
  medium_tasks: number;
  complex_tasks: number;
  
  // Status Indicators
  status: UtilizationStatus;
  utilization_trend: 'Increasing' | 'Stable' | 'Decreasing';
  optimal_task_range: [number, number]; // [min, max] tasks per period
  
  // Predictions
  predicted_completion_count: number;
  bottleneck_risk: 'Low' | 'Medium' | 'High';
  context_switch_penalty: number;
}

export type UtilizationStatus = 
  | 'Severely Overloaded' 
  | 'Overloaded' 
  | 'Optimally Loaded' 
  | 'Well Utilized' 
  | 'Moderately Utilized' 
  | 'Underutilized';

export interface TaskCapacity {
  base_capacity: number;
  skill_adjusted_capacity: number;
  complexity_capacity: ComplexityCapacityBreakdown;
  collaborative_capacity: number;
}

export interface ComplexityCapacityBreakdown {
  simple_tasks_per_period: number;
  medium_tasks_per_period: number;
  complex_tasks_per_period: number;
}

export interface TaskAvailability {
  available_task_slots: number;
  availability_percentage: number;
  
  // Granular availability by task type
  simple_task_slots_available: number;
  medium_task_slots_available: number;
  complex_task_slots_available: number;
  
  // Smart availability considering context switching
  recommended_new_tasks: number;
  context_switch_impact: number;
  
  // Future availability prediction
  next_period_availability: number;
  task_completion_forecast: number;
}