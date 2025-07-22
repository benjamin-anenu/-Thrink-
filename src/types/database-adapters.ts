// Type adapters for database-to-interface conversion
import { Resource } from '@/contexts/ResourceContext';
import { 
  ResourceProfile, 
  TaskIntelligence, 
  AIAssignmentRecommendation,
  SkillProficiency 
} from './enhanced-resource';

// Adapter to convert database resource to Resource interface
export const adaptDatabaseResource = (dbResource: any): Resource => {
  return {
    id: dbResource.id,
    workspaceId: dbResource.workspace_id,
    name: dbResource.name,
    email: dbResource.email || '',
    phone: '', // Default empty as not in new schema
    location: '', // Default empty as not in new schema
    role: dbResource.role || '',
    department: dbResource.department || '',
    skills: [], // Will be populated separately from skill_proficiencies
    availability: 100, // Default value as number
    hourlyRate: '0', // Default value as string (interface expects string)
    utilization: 0, // Will be calculated
    currentProjects: [], // Default empty array (note: camelCase)
    status: 'Available' as const, // Default status
    createdAt: dbResource.created_at,
    updatedAt: dbResource.updated_at
  };
};

// Adapter to convert database task to TaskIntelligence interface
export const adaptDatabaseTask = (dbTask: any): TaskIntelligence => {
  return {
    id: dbTask.id,
    project_id: dbTask.project_id,
    name: dbTask.name,
    description: dbTask.description,
    
    // Task Complexity & Effort with defaults
    complexity_score: dbTask.complexity_score || 5,
    effort_points: dbTask.effort_points || 5,
    task_size: (dbTask.task_size as 'XS' | 'S' | 'M' | 'L' | 'XL') || 'M',
    confidence_level: dbTask.confidence_level || 5,
    
    // Dependencies & Relationships
    dependency_weight: dbTask.dependency_weight || 1,
    parallel_task_capacity: dbTask.parallel_task_capacity || 1,
    dependencies: dbTask.dependencies || [],
    
    // Skill Requirements
    required_skills: dbTask.task_skill_requirements?.map((req: any) => ({
      id: req.id,
      task_id: req.task_id,
      skill_id: req.skill_id,
      skill_name: req.skills?.name || 'Unknown Skill',
      requirement_type: req.requirement_type || 'primary',
      minimum_proficiency: req.minimum_proficiency || 5,
      created_at: req.created_at
    })) || [],
    
    // Context & Environment
    requires_deep_focus: dbTask.requires_deep_focus || false,
    collaboration_intensity: (dbTask.collaboration_intensity as 'Low' | 'Medium' | 'High') || 'Medium',
    context_switching_penalty: dbTask.context_switching_penalty || 5,
    knowledge_transfer_required: dbTask.knowledge_transfer_required || false,
    
    // Auto-tracking
    actual_complexity: dbTask.actual_complexity,
    completion_percentage: dbTask.progress || 0,
    blocker_count: dbTask.blocker_count || 0,
    rework_cycles: dbTask.rework_cycles || 0,
    
    // Standard task fields
    status: dbTask.status || 'Pending',
    priority: dbTask.priority || 'Medium',
    assignee_id: dbTask.assignee_id,
    start_date: dbTask.start_date,
    end_date: dbTask.end_date,
    completed_at: dbTask.completed_at
  };
};

// Adapter to convert ResourceProfile to database format
export const adaptResourceProfileToDb = (profile: ResourceProfile) => {
  return {
    id: profile.id,
    resource_id: profile.resource_id,
    workspace_id: profile.workspace_id,
    employee_id: profile.employee_id,
    seniority_level: profile.seniority_level || 'Mid',
    optimal_task_count_per_day: profile.optimal_task_count_per_day,
    optimal_task_count_per_week: profile.optimal_task_count_per_week,
    timezone: profile.timezone,
    work_days: profile.work_days,
    preferred_work_style: profile.preferred_work_style || 'Mixed',
    task_switching_preference: profile.task_switching_preference || 'Sequential',
    historical_task_velocity: profile.historical_task_velocity,
    complexity_handling_score: profile.complexity_handling_score,
    collaboration_effectiveness: profile.collaboration_effectiveness,
    learning_task_success_rate: profile.learning_task_success_rate,
    peak_productivity_periods: profile.peak_productivity_periods,
    task_switching_penalty_score: profile.task_switching_penalty_score,
    new_project_ramp_up_tasks: profile.new_project_ramp_up_tasks,
    employment_type: profile.employment_type || 'Full-time',
    contract_end_date: profile.contract_end_date,
    planned_time_off: JSON.stringify(profile.planned_time_off),
    recurring_commitments: JSON.stringify(profile.recurring_commitments),
    strength_keywords: profile.strength_keywords,
    growth_areas: profile.growth_areas,
    career_aspirations: profile.career_aspirations,
    mentorship_capacity: profile.mentorship_capacity,
    last_activity: profile.last_activity,
    current_projects: profile.current_projects,
    created_at: profile.created_at,
    updated_at: profile.updated_at
  };
};

// Adapter to convert database ResourceProfile back to interface
export const adaptDatabaseResourceProfile = (dbProfile: any): ResourceProfile => {
  return {
    id: dbProfile.id,
    resource_id: dbProfile.resource_id,
    workspace_id: dbProfile.workspace_id,
    employee_id: dbProfile.employee_id,
    seniority_level: dbProfile.seniority_level as 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal',
    optimal_task_count_per_day: dbProfile.optimal_task_count_per_day,
    optimal_task_count_per_week: dbProfile.optimal_task_count_per_week,
    timezone: dbProfile.timezone,
    work_days: dbProfile.work_days,
    preferred_work_style: dbProfile.preferred_work_style as 'Deep Focus' | 'Collaborative' | 'Mixed',
    task_switching_preference: dbProfile.task_switching_preference as 'Sequential' | 'Parallel' | 'Batched',
    historical_task_velocity: dbProfile.historical_task_velocity,
    complexity_handling_score: dbProfile.complexity_handling_score,
    collaboration_effectiveness: dbProfile.collaboration_effectiveness,
    learning_task_success_rate: dbProfile.learning_task_success_rate,
    peak_productivity_periods: dbProfile.peak_productivity_periods,
    task_switching_penalty_score: dbProfile.task_switching_penalty_score,
    new_project_ramp_up_tasks: dbProfile.new_project_ramp_up_tasks,
    employment_type: dbProfile.employment_type as 'Full-time' | 'Part-time' | 'Contract' | 'Consultant',
    contract_end_date: dbProfile.contract_end_date,
    planned_time_off: typeof dbProfile.planned_time_off === 'string' ? 
      JSON.parse(dbProfile.planned_time_off) : dbProfile.planned_time_off || [],
    recurring_commitments: typeof dbProfile.recurring_commitments === 'string' ? 
      JSON.parse(dbProfile.recurring_commitments) : dbProfile.recurring_commitments || [],
    strength_keywords: dbProfile.strength_keywords || [],
    growth_areas: dbProfile.growth_areas || [],
    career_aspirations: dbProfile.career_aspirations || [],
    mentorship_capacity: dbProfile.mentorship_capacity || false,
    last_activity: dbProfile.last_activity,
    current_projects: dbProfile.current_projects || [],
    created_at: dbProfile.created_at,
    updated_at: dbProfile.updated_at
  };
};

// Adapter for AI recommendation to database format
export const adaptAIRecommendationToDb = (recommendation: Omit<AIAssignmentRecommendation, 'id'>) => {
  return {
    project_id: recommendation.project_id,
    resource_id: recommendation.resource_id,
    workspace_id: recommendation.workspace_id,
    task_capacity_fit_score: recommendation.task_capacity_fit_score,
    complexity_handling_fit_score: recommendation.complexity_handling_fit_score,
    skill_match_score: recommendation.skill_match_score,
    availability_score: recommendation.availability_score,
    collaboration_fit_score: recommendation.collaboration_fit_score,
    learning_opportunity_score: recommendation.learning_opportunity_score,
    overall_fit_score: recommendation.overall_fit_score,
    task_completion_forecast: recommendation.task_completion_forecast,
    quality_prediction: recommendation.quality_prediction,
    timeline_confidence: recommendation.timeline_confidence,
    success_probability: recommendation.success_probability,
    overload_risk_score: recommendation.overload_risk_score,
    skill_gap_risk_score: recommendation.skill_gap_risk_score,
    context_switching_impact: recommendation.context_switching_impact,
    recommended_task_count: recommendation.recommended_task_count,
    reasoning: JSON.stringify(recommendation.reasoning),
    alternative_assignments: JSON.stringify(recommendation.alternative_assignments),
    created_at: recommendation.created_at,
    expires_at: recommendation.expires_at
  };
};

// Type guard for period types
export const isPeriodType = (value: string): value is 'day' | 'week' | 'month' => {
  return ['day', 'week', 'month'].includes(value);
};