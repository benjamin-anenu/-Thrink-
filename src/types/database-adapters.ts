
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
    resource_id: profile.resourceId,
    workspace_id: profile.workspaceId,
    employee_id: profile.employeeId,
    seniority_level: profile.seniorityLevel || 'Mid',
    optimal_task_count_per_day: profile.optimalTaskCountPerDay,
    optimal_task_count_per_week: profile.optimalTaskCountPerWeek,
    timezone: profile.timezone,
    work_days: profile.workDays,
    preferred_work_style: profile.preferredWorkStyle || 'Mixed',
    task_switching_preference: profile.taskSwitchingPreference || 'Sequential',
    historical_task_velocity: profile.historicalTaskVelocity,
    complexity_handling_score: profile.complexityHandlingScore,
    collaboration_effectiveness: profile.collaborationEffectiveness,
    learning_task_success_rate: profile.learningTaskSuccessRate,
    peak_productivity_periods: profile.peakProductivityPeriods,
    task_switching_penalty_score: profile.taskSwitchingPenaltyScore,
    new_project_ramp_up_tasks: profile.newProjectRampUpTasks,
    employment_type: profile.employmentType || 'Full-time',
    contract_end_date: profile.contractEndDate,
    planned_time_off: JSON.stringify(profile.plannedTimeOff),
    recurring_commitments: JSON.stringify(profile.recurringCommitments),
    strength_keywords: profile.strengthKeywords,
    growth_areas: profile.growthAreas,
    career_aspirations: profile.careerAspirations,
    mentorship_capacity: profile.mentorshipCapacity,
    last_activity: profile.lastActivity,
    current_projects: profile.currentProjects,
    created_at: profile.createdAt,
    updated_at: profile.updatedAt
  };
};

// Adapter to convert database ResourceProfile back to interface
export const adaptDatabaseResourceProfile = (dbProfile: any): ResourceProfile => {
  return {
    id: dbProfile.id,
    resourceId: dbProfile.resource_id,
    workspaceId: dbProfile.workspace_id,
    employeeId: dbProfile.employee_id,
    seniorityLevel: dbProfile.seniority_level as 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Principal',
    optimalTaskCountPerDay: dbProfile.optimal_task_count_per_day,
    optimalTaskCountPerWeek: dbProfile.optimal_task_count_per_week,
    timezone: dbProfile.timezone,
    workDays: dbProfile.work_days,
    preferredWorkStyle: dbProfile.preferred_work_style as 'Deep Focus' | 'Collaborative' | 'Mixed',
    taskSwitchingPreference: dbProfile.task_switching_preference as 'Sequential' | 'Parallel' | 'Batched',
    historicalTaskVelocity: dbProfile.historical_task_velocity,
    complexityHandlingScore: dbProfile.complexity_handling_score,
    collaborationEffectiveness: dbProfile.collaboration_effectiveness,
    learningTaskSuccessRate: dbProfile.learning_task_success_rate,
    peakProductivityPeriods: dbProfile.peak_productivity_periods,
    taskSwitchingPenaltyScore: dbProfile.task_switching_penalty_score,
    newProjectRampUpTasks: dbProfile.new_project_ramp_up_tasks,
    employmentType: dbProfile.employment_type as 'Full-time' | 'Part-time' | 'Contract' | 'Consultant',
    contractEndDate: dbProfile.contract_end_date,
    plannedTimeOff: typeof dbProfile.planned_time_off === 'string' ? 
      JSON.parse(dbProfile.planned_time_off) : dbProfile.planned_time_off || [],
    recurringCommitments: typeof dbProfile.recurring_commitments === 'string' ? 
      JSON.parse(dbProfile.recurring_commitments) : dbProfile.recurring_commitments || [],
    strengthKeywords: dbProfile.strength_keywords || [],
    growthAreas: dbProfile.growth_areas || [],
    careerAspirations: dbProfile.career_aspirations || [],
    mentorshipCapacity: dbProfile.mentorship_capacity || false,
    lastActivity: dbProfile.last_activity,
    currentProjects: dbProfile.current_projects || [],
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
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
