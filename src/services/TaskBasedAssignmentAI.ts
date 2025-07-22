import { supabase } from "@/integrations/supabase/client";
import { 
  AIAssignmentRecommendation, 
  ResourceProfile, 
  TaskIntelligence,
  TaskMatch,
  CapacityAnalysis,
  AlternativeAssignment 
} from "@/types/enhanced-resource";
import { 
  adaptDatabaseTask, 
  adaptDatabaseResourceProfile, 
  adaptAIRecommendationToDb 
} from "@/types/database-adapters";
import { taskUtilizationEngine } from "./TaskBasedUtilizationEngine";

export class TaskBasedAssignmentAI {
  async suggestOptimalAssignment(
    projectId: string,
    availableResources: string[]
  ): Promise<AIAssignmentRecommendation[]> {
    const projectTasks = await this.getProjectTasks(projectId);
    const recommendations: AIAssignmentRecommendation[] = [];

    for (const resourceId of availableResources) {
      const recommendation = await this.generateResourceRecommendation(
        projectId, 
        resourceId, 
        projectTasks
      );
      recommendations.push(recommendation);
    }

    // Sort by overall fit score
    return recommendations.sort((a, b) => b.overall_fit_score - a.overall_fit_score);
  }

  private async generateResourceRecommendation(
    projectId: string,
    resourceId: string,
    projectTasks: TaskIntelligence[]
  ): Promise<AIAssignmentRecommendation> {
    // Get resource profile and current utilization
    const resourceProfile = await this.getResourceProfile(resourceId);
    const utilization = await taskUtilizationEngine.calculateTaskUtilization(resourceId, 'week');
    const availability = await taskUtilizationEngine.calculateTaskAvailability(resourceId, 'week');

    // Calculate various fit scores
    const taskCapacityFit = this.calculateTaskCapacityFit(resourceProfile, projectTasks, utilization);
    const complexityHandlingFit = this.assessComplexityFit(resourceProfile, projectTasks);
    const skillMatchScore = await this.calculateSkillMatch(resourceId, projectTasks);
    const availabilityScore = this.calculateAvailabilityScore(availability);
    const collaborationFit = this.assessCollaborationFit(resourceProfile, projectTasks);
    const learningOpportunity = await this.assessLearningOpportunities(resourceId, projectTasks);

    // Calculate overall fit score
    const overallFitScore = this.calculateOverallFitScore({
      taskCapacityFit,
      complexityHandlingFit,
      skillMatchScore,
      availabilityScore,
      collaborationFit,
      learningOpportunity
    });

    // Generate predictions
    const predictions = await this.generatePredictions(resourceId, projectTasks, resourceProfile);
    
    // Assess risks
    const risks = this.assessRisks(resourceProfile, projectTasks, utilization);

    // Generate reasoning and alternatives
    const reasoning = await this.generateReasoning(resourceId, projectTasks, resourceProfile);
    const alternatives = await this.generateAlternatives(projectId, resourceId, projectTasks);

    // Get workspace ID
    const { data: resource } = await supabase
      .from('resources')
      .select('workspace_id')
      .eq('id', resourceId)
      .single();

    const recommendation: AIAssignmentRecommendation = {
      id: '', // Will be set by database
      project_id: projectId,
      resource_id: resourceId,
      workspace_id: resource?.workspace_id || '',
      
      // Scoring metrics
      task_capacity_fit_score: taskCapacityFit,
      complexity_handling_fit_score: complexityHandlingFit,
      skill_match_score: skillMatchScore,
      availability_score: availabilityScore,
      collaboration_fit_score: collaborationFit,
      learning_opportunity_score: learningOpportunity,
      overall_fit_score: overallFitScore,
      
      // Predictions
      task_completion_forecast: predictions.completionForecast,
      quality_prediction: predictions.qualityPrediction,
      timeline_confidence: predictions.timelineConfidence,
      success_probability: predictions.successProbability,
      
      // Risk assessment
      overload_risk_score: risks.overloadRisk,
      skill_gap_risk_score: risks.skillGapRisk,
      context_switching_impact: risks.contextSwitchingImpact,
      
      // Recommendation data
      recommended_task_count: this.calculateRecommendedTaskCount(resourceProfile, projectTasks, availability),
      reasoning,
      alternative_assignments: alternatives,
      
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
    };

    // Save recommendation to database using adapter
    const dbRecommendation = adaptAIRecommendationToDb(recommendation);
    const { data, error } = await supabase
      .from('ai_assignment_recommendations')
      .insert(dbRecommendation)
      .select()
      .single();

    if (error) {
      console.error('Error saving AI recommendation:', error);
      return recommendation;
    }

    // Convert back from database format
    return {
      ...recommendation,
      id: data.id,
      reasoning: typeof data.reasoning === 'string' ? JSON.parse(data.reasoning) : data.reasoning,
      alternative_assignments: typeof data.alternative_assignments === 'string' ? 
        JSON.parse(data.alternative_assignments) : data.alternative_assignments
    };
  }

  private async getProjectTasks(projectId: string): Promise<TaskIntelligence[]> {
    const { data, error } = await supabase
      .from('project_tasks')
      .select(`
        *,
        task_skill_requirements (
          id,
          skill_id,
          requirement_type,
          minimum_proficiency,
          skills (name)
        )
      `)
      .eq('project_id', projectId)
      .in('status', ['Pending', 'In Progress']);

    if (error) {
      console.error('Error fetching project tasks:', error);
      return [];
    }

    return data?.map(task => adaptDatabaseTask(task)) || [];
  }

  private async getResourceProfile(resourceId: string): Promise<ResourceProfile | null> {
    const { data, error } = await supabase
      .from('resource_profiles')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (!data) return null;

    return adaptDatabaseResourceProfile(data);
  }

  private calculateTaskCapacityFit(
    profile: ResourceProfile | null, 
    tasks: TaskIntelligence[], 
    utilization: any
  ): number {
    if (!profile) return 0.5; // Neutral score if no profile

    const optimalWeeklyTasks = profile.optimal_task_count_per_week;
    const currentUtilization = utilization.utilization_percentage;
    const projectTaskLoad = tasks.length;

    // Calculate fit based on current capacity and project requirements
    const remainingCapacity = optimalWeeklyTasks * (1 - currentUtilization / 100);
    const capacityFit = Math.min(remainingCapacity / projectTaskLoad, 1.0);

    return Math.max(0, Math.min(1.0, capacityFit));
  }

  private assessComplexityFit(profile: ResourceProfile | null, tasks: TaskIntelligence[]): number {
    if (!profile) return 0.5;

    const resourceComplexityHandling = profile.complexity_handling_score;
    const averageTaskComplexity = tasks.reduce((sum, task) => sum + (task.complexity_score || 5), 0) / tasks.length;

    // Higher fit when resource complexity handling matches or exceeds task complexity
    const complexityRatio = resourceComplexityHandling / averageTaskComplexity;
    return Math.max(0, Math.min(1.0, complexityRatio / 1.2)); // Normalize to 0-1 scale
  }

  private async calculateSkillMatch(resourceId: string, tasks: TaskIntelligence[]): Promise<number> {
    // Get resource skills
    const { data: resourceSkills } = await supabase
      .from('skill_proficiencies')
      .select('skill_id, proficiency_level')
      .eq('resource_id', resourceId);

    if (!resourceSkills || resourceSkills.length === 0) return 0;

    // Get all required skills from tasks
    const requiredSkills = tasks.flatMap(task => task.required_skills || []);
    if (requiredSkills.length === 0) return 0.5; // Neutral if no requirements

    let totalMatch = 0;
    let totalRequirements = 0;

    requiredSkills.forEach(requirement => {
      const resourceSkill = resourceSkills.find(rs => rs.skill_id === requirement.skill_id);
      totalRequirements++;

      if (resourceSkill) {
        const proficiencyMatch = Math.min(
          resourceSkill.proficiency_level / requirement.minimum_proficiency, 
          1.0
        );
        
        // Weight by requirement type
        const weight = requirement.requirement_type === 'primary' ? 1.0 :
                      requirement.requirement_type === 'secondary' ? 0.7 :
                      requirement.requirement_type === 'nice_to_have' ? 0.3 : 0.5;
        
        totalMatch += proficiencyMatch * weight;
      }
    });

    return totalRequirements > 0 ? totalMatch / totalRequirements : 0;
  }

  private calculateAvailabilityScore(availability: any): number {
    // Convert availability percentage to 0-1 score
    return Math.max(0, Math.min(1.0, availability.availability_percentage / 100));
  }

  private assessCollaborationFit(profile: ResourceProfile | null, tasks: TaskIntelligence[]): number {
    if (!profile) return 0.5;

    const resourceCollaborationPreference = profile.preferred_work_style;
    const collaborationTasks = tasks.filter(task => task.collaboration_intensity === 'High').length;
    const totalTasks = tasks.length;
    const collaborationRatio = totalTasks > 0 ? collaborationTasks / totalTasks : 0;

    // Score based on preference match
    if (resourceCollaborationPreference === 'Collaborative' && collaborationRatio > 0.5) return 0.9;
    if (resourceCollaborationPreference === 'Deep Focus' && collaborationRatio < 0.3) return 0.9;
    if (resourceCollaborationPreference === 'Mixed') return 0.7;

    // Moderate fit for mismatches
    return 0.5;
  }

  private async assessLearningOpportunities(resourceId: string, tasks: TaskIntelligence[]): Promise<number> {
    const { data: resourceSkills } = await supabase
      .from('skill_proficiencies')
      .select('skill_id, proficiency_level')
      .eq('resource_id', resourceId);

    const learningOpportunities = tasks.flatMap(task => 
      task.required_skills?.filter(req => req.requirement_type === 'learning_opportunity') || []
    );

    if (learningOpportunities.length === 0) return 0;

    let learningScore = 0;
    learningOpportunities.forEach(opportunity => {
      const currentSkill = resourceSkills?.find(rs => rs.skill_id === opportunity.skill_id);
      if (!currentSkill || currentSkill.proficiency_level < opportunity.minimum_proficiency) {
        learningScore += 0.8; // High learning value
      } else {
        learningScore += 0.2; // Some learning value
      }
    });

    return Math.min(1.0, learningScore / learningOpportunities.length);
  }

  private calculateOverallFitScore(scores: {
    taskCapacityFit: number;
    complexityHandlingFit: number;
    skillMatchScore: number;
    availabilityScore: number;
    collaborationFit: number;
    learningOpportunity: number;
  }): number {
    // Weighted average of all scores
    const weights = {
      taskCapacityFit: 0.25,
      complexityHandlingFit: 0.20,
      skillMatchScore: 0.25,
      availabilityScore: 0.15,
      collaborationFit: 0.10,
      learningOpportunity: 0.05
    };

    return Object.entries(weights).reduce((total, [key, weight]) => {
      return total + (scores[key as keyof typeof scores] * weight);
    }, 0);
  }

  private async generatePredictions(
    resourceId: string, 
    tasks: TaskIntelligence[], 
    profile: ResourceProfile | null
  ) {
    const historicalVelocity = profile?.historical_task_velocity || 0.8;
    const complexityHandling = profile?.complexity_handling_score || 5;
    const averageComplexity = tasks.reduce((sum, task) => sum + (task.complexity_score || 5), 0) / Math.max(tasks.length, 1);

    return {
      completionForecast: Math.min(1.0, historicalVelocity * (complexityHandling / averageComplexity)),
      qualityPrediction: Math.min(1.0, (complexityHandling / 10) * 0.9),
      timelineConfidence: Math.min(1.0, historicalVelocity * 0.9),
      successProbability: Math.min(1.0, (historicalVelocity + (complexityHandling / 10)) / 2)
    };
  }

  private assessRisks(
    profile: ResourceProfile | null, 
    tasks: TaskIntelligence[], 
    utilization: any
  ) {
    const currentUtilization = utilization.utilization_percentage;
    const taskComplexity = tasks.reduce((sum, task) => sum + (task.complexity_score || 5), 0) / Math.max(tasks.length, 1);
    const taskSwitchingPenalty = profile?.task_switching_penalty_score || 5;

    return {
      overloadRisk: Math.min(10, Math.floor(currentUtilization / 10)),
      skillGapRisk: taskComplexity > 7 ? 7 : taskComplexity > 5 ? 4 : 2,
      contextSwitchingImpact: (taskSwitchingPenalty / 10) * (tasks.length / 10)
    };
  }

  private async generateReasoning(
    resourceId: string, 
    tasks: TaskIntelligence[], 
    profile: ResourceProfile | null
  ) {
    const taskMatches = await this.findBestTaskMatches(resourceId, tasks);
    const capacityAnalysis = this.analyzeCapacity(profile, tasks);

    return {
      task_matches: taskMatches,
      capacity_analysis: capacityAnalysis,
      potential_blockers: this.identifyPotentialBlockers(profile, tasks),
      success_factors: this.identifySuccessFactors(profile, tasks),
      risk_factors: this.identifyRiskFactors(profile, tasks)
    };
  }

  private async findBestTaskMatches(resourceId: string, tasks: TaskIntelligence[]): Promise<TaskMatch[]> {
    const matches: TaskMatch[] = [];
    
    for (const task of tasks.slice(0, 5)) { // Limit to top 5 matches
      const skillMatch = await this.calculateSkillMatch(resourceId, [task]);
      matches.push({
        task_id: task.id,
        task_name: task.name,
        fit_score: skillMatch,
        reasoning: `Skill match: ${Math.round(skillMatch * 100)}%`,
        learning_opportunity: task.required_skills?.some(req => req.requirement_type === 'learning_opportunity') || false
      });
    }

    return matches.sort((a, b) => b.fit_score - a.fit_score);
  }

  private analyzeCapacity(profile: ResourceProfile | null, tasks: TaskIntelligence[]): CapacityAnalysis {
    const optimalTasks = profile?.optimal_task_count_per_week || 15;
    const projectTaskLoad = tasks.length;

    return {
      current_utilization: 75, // Placeholder
      additional_capacity_needed: Math.max(0, projectTaskLoad - optimalTasks),
      optimal_task_distribution: `${Math.min(projectTaskLoad, optimalTasks)} tasks per week`,
      timeline_impact: projectTaskLoad > optimalTasks ? 'May extend timeline' : 'On track'
    };
  }

  private identifyPotentialBlockers(profile: ResourceProfile | null, tasks: TaskIntelligence[]): string[] {
    const blockers: string[] = [];
    
    if (tasks.some(task => (task.complexity_score || 5) > 8)) {
      blockers.push('High complexity tasks may require additional support');
    }
    
    if (profile?.task_switching_preference === 'Sequential' && tasks.length > 3) {
      blockers.push('Resource prefers sequential work but multiple tasks assigned');
    }

    return blockers;
  }

  private identifySuccessFactors(profile: ResourceProfile | null, tasks: TaskIntelligence[]): string[] {
    const factors: string[] = [];
    
    if (profile?.complexity_handling_score && profile.complexity_handling_score > 7) {
      factors.push('High complexity handling capability');
    }
    
    if (profile?.collaboration_effectiveness && profile.collaboration_effectiveness > 0.8) {
      factors.push('Strong collaboration skills');
    }

    return factors;
  }

  private identifyRiskFactors(profile: ResourceProfile | null, tasks: TaskIntelligence[]): string[] {
    const risks: string[] = [];
    
    if (tasks.some(task => task.requires_deep_focus) && profile?.preferred_work_style === 'Collaborative') {
      risks.push('Deep focus tasks may not match collaborative preference');
    }

    return risks;
  }

  private calculateRecommendedTaskCount(
    profile: ResourceProfile | null, 
    tasks: TaskIntelligence[], 
    availability: any
  ): number {
    const availableSlots = availability.available_task_slots;
    const optimalWeekly = profile?.optimal_task_count_per_week || 15;
    
    return Math.min(availableSlots, Math.floor(optimalWeekly * 0.3)); // Max 30% of weekly capacity per project
  }

  private async generateAlternatives(
    projectId: string, 
    excludeResourceId: string, 
    tasks: TaskIntelligence[]
  ): Promise<AlternativeAssignment[]> {
    // Get other available resources in the workspace
    const { data: resources } = await supabase
      .from('resources')
      .select('id, name')
      .neq('id', excludeResourceId)
      .limit(3);

    if (!resources) return [];

    const alternatives: AlternativeAssignment[] = [];
    
    for (const resource of resources) {
      const skillMatch = await this.calculateSkillMatch(resource.id, tasks);
      alternatives.push({
        resource_id: resource.id,
        resource_name: resource.name,
        fit_score: skillMatch,
        reasoning: `Alternative with ${Math.round(skillMatch * 100)}% skill match`,
        trade_offs: ['Different skill profile', 'May require different timeline']
      });
    }

    return alternatives.sort((a, b) => b.fit_score - a.fit_score);
  }
}

export const taskAssignmentAI = new TaskBasedAssignmentAI();