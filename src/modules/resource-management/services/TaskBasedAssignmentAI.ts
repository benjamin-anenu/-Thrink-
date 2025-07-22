import { 
  ResourceProfile,
  TaskUtilizationMetrics 
} from '../types/ResourceProfile';
import { 
  TaskIntelligence,
  TaskAssignmentRecommendation,
  TaskCapacityFit,
  TaskRecommendation,
  AssignmentReasoning,
  TaskMatch,
  CapacityAnalysis,
  AlternativeTaskDistribution,
  TaskPerformancePrediction,
  ProjectIntelligence 
} from '../types/TaskIntelligence';
import { TaskBasedUtilizationEngine } from './TaskBasedUtilizationEngine';

export class TaskBasedAssignmentAI {
  private utilizationEngine: TaskBasedUtilizationEngine;

  constructor() {
    this.utilizationEngine = new TaskBasedUtilizationEngine();
  }

  /**
   * Main method to get optimal assignment recommendations for a project
   */
  async suggestOptimalAssignment(
    projectId: string,
    availableResources: ResourceProfile[]
  ): Promise<TaskAssignmentRecommendation[]> {
    
    const projectTasks = await this.getProjectTasks(projectId);
    const project = await this.getProjectIntelligence(projectId);
    
    // Multi-factor AI scoring for each resource
    const recommendations = await Promise.all(
      availableResources.map(resource => this.evaluateResourceForProject(resource, project, projectTasks))
    );
    
    // Sort by overall fit score (weighted combination of all factors)
    return recommendations.sort((a, b) => this.calculateOverallFitScore(b) - this.calculateOverallFitScore(a));
  }

  /**
   * Evaluate a single resource for assignment to a project
   */
  private async evaluateResourceForProject(
    resource: ResourceProfile,
    project: ProjectIntelligence,
    projectTasks: TaskIntelligence[]
  ): Promise<TaskAssignmentRecommendation> {
    
    // Calculate all the different fit dimensions
    const taskCapacityFit = await this.calculateTaskCapacityFit(resource, projectTasks);
    const complexityFit = this.assessComplexityFit(resource, projectTasks);
    const taskVarietyFit = this.assessTaskVarietyMatch(resource, projectTasks);
    const skillFit = await this.assessSkillFit(resource, projectTasks);
    
    // Get availability information
    const availability = await this.utilizationEngine.calculateTaskAvailability(resource.id, 'week');
    
    // Generate specific task recommendations
    const recommendedTasks = await this.recommendSpecificTasks(resource, projectTasks);
    
    // Predict performance outcomes
    const performancePredictions = await this.predictPerformanceOutcomes(resource, projectTasks);
    
    // Assess team dynamics
    const collaborationFit = await this.assessCollaborationFit(resource, project, projectTasks);
    
    // Calculate risk factors
    const riskAssessment = await this.assessAssignmentRisks(resource, projectTasks);
    
    // Generate detailed reasoning
    const reasoning = await this.generateAssignmentReasoning(
      resource, 
      projectTasks, 
      taskCapacityFit,
      skillFit,
      riskAssessment
    );

    return {
      resource_id: resource.id,
      
      // Task-based fit scoring
      task_capacity_fit: taskCapacityFit,
      complexity_handling_fit: complexityFit,
      task_variety_preference: taskVarietyFit,
      
      // Availability in task slots
      available_task_slots: availability.available_task_slots,
      recommended_task_assignment: recommendedTasks,
      
      // Performance predictions
      task_completion_forecast: performancePredictions.completion_forecast,
      quality_prediction: performancePredictions.quality_prediction,
      learning_growth_potential: performancePredictions.learning_potential,
      
      // Team dynamics (task-based)
      collaboration_task_fit: collaborationFit.fit_score,
      knowledge_transfer_capacity: collaborationFit.transfer_capacity,
      
      // Risk assessment
      task_overload_risk: riskAssessment.overload_risk,
      skill_gap_risks: riskAssessment.skill_gaps,
      context_switching_impact: riskAssessment.context_switching_impact,
      
      // Detailed reasoning for transparency
      reasoning: reasoning
    };
  }

  /**
   * Calculate how well a resource's task capacity fits the project needs
   */
  private async calculateTaskCapacityFit(
    resource: ResourceProfile, 
    tasks: TaskIntelligence[]
  ): Promise<TaskCapacityFit> {
    
    const currentUtilization = await this.utilizationEngine.calculateTaskUtilization(resource.id, 'week');
    const resourceCapacity = resource.optimal_task_count_per_week;
    const currentLoad = currentUtilization.task_count;
    const projectTaskLoad = this.calculateProjectTaskLoad(tasks);
    
    // Calculate fit scores
    const capacityUsage = (currentLoad / resourceCapacity) * 100;
    const remainingCapacity = Math.max(0, resourceCapacity - currentLoad);
    const capacityFitScore = this.calculateCapacityFitScore(resourceCapacity, currentLoad, projectTaskLoad);
    
    // Determine optimal task assignment count
    const optimalAssignment = Math.min(
      remainingCapacity,
      this.getOptimalNewTaskCount(resource, tasks),
      Math.ceil(projectTaskLoad * 0.3) // Don't assign more than 30% of project tasks to one person
    );
    
    // Assess task size distribution fit
    const taskSizeDistributionFit = this.assessTaskSizeDistributionFit(resource, tasks);
    
    return {
      current_capacity_usage: capacityUsage,
      additional_capacity_needed: projectTaskLoad,
      capacity_fit_score: capacityFitScore,
      optimal_task_assignment_count: optimalAssignment,
      task_size_distribution_fit: taskSizeDistributionFit
    };
  }

  /**
   * Calculate capacity fit score (0-1) based on utilization sweet spot
   */
  private calculateCapacityFitScore(
    capacity: number, 
    currentLoad: number, 
    additionalLoad: number
  ): number {
    
    const totalLoad = currentLoad + additionalLoad;
    const utilization = totalLoad / capacity;
    
    // Optimal utilization is 70-90%
    if (utilization >= 0.7 && utilization <= 0.9) {
      return 1.0; // Perfect fit
    } else if (utilization >= 0.5 && utilization <= 1.1) {
      // Good fit with slight penalty
      const penalty = Math.abs(0.8 - utilization) * 2;
      return Math.max(0.3, 1.0 - penalty);
    } else {
      // Poor fit - either underutilized or overloaded
      return Math.max(0.1, 0.5 - Math.abs(0.8 - utilization));
    }
  }

  /**
   * Assess how well the resource can handle the complexity mix of tasks
   */
  private assessComplexityFit(resource: ResourceProfile, tasks: TaskIntelligence[]): number {
    
    // Calculate task complexity distribution
    const complexityDistribution = this.calculateTaskComplexityDistribution(tasks);
    
    // Compare with resource's optimal complexity mix
    const resourceMix = resource.optimal_task_complexity_mix;
    
    // Calculate fit score based on how well distributions match
    const simpleFit = 1 - Math.abs(complexityDistribution.simple - resourceMix.simple_tasks_percentage);
    const mediumFit = 1 - Math.abs(complexityDistribution.medium - resourceMix.medium_tasks_percentage);
    const complexFit = 1 - Math.abs(complexityDistribution.complex - resourceMix.complex_tasks_percentage);
    
    // Weighted average (give more weight to avoiding overcomplex assignments)
    return (simpleFit * 0.3) + (mediumFit * 0.4) + (complexFit * 0.3);
  }

  /**
   * Calculate project task complexity distribution
   */
  private calculateTaskComplexityDistribution(tasks: TaskIntelligence[]): {
    simple: number,
    medium: number,
    complex: number
  } {
    if (tasks.length === 0) return { simple: 0, medium: 0, complex: 0 };
    
    const simple = tasks.filter(t => t.complexity_score <= 3).length / tasks.length;
    const medium = tasks.filter(t => t.complexity_score > 3 && t.complexity_score <= 6).length / tasks.length;
    const complex = tasks.filter(t => t.complexity_score > 6).length / tasks.length;
    
    return { simple, medium, complex };
  }

  /**
   * Assess how well task variety matches resource preferences
   */
  private assessTaskVarietyMatch(resource: ResourceProfile, tasks: TaskIntelligence[]): number {
    
    // Consider resource's task switching preference
    const uniqueProjectCount = new Set(tasks.map(t => t.project_id)).size;
    const collaborativeTasksRatio = tasks.filter(t => t.collaboration_intensity !== 'Low').length / tasks.length;
    const focusTasksRatio = tasks.filter(t => t.requires_deep_focus).length / tasks.length;
    
    let varietyScore = 0.5; // Base score
    
    // Adjust based on work style preference
    switch (resource.preferred_work_style) {
      case 'Deep Focus':
        varietyScore += focusTasksRatio * 0.4;
        varietyScore -= collaborativeTasksRatio * 0.2;
        break;
      case 'Collaborative':
        varietyScore += collaborativeTasksRatio * 0.4;
        varietyScore -= focusTasksRatio * 0.1;
        break;
      case 'Mixed':
        varietyScore += 0.2; // Benefits from variety
        break;
    }
    
    // Adjust based on task switching preference
    const taskSwitchingPenalty = resource.task_switching_penalty_score / 10;
    if (resource.task_switching_preference === 'Sequential' && uniqueProjectCount > 1) {
      varietyScore -= taskSwitchingPenalty * 0.3;
    }
    
    return Math.max(0, Math.min(1, varietyScore));
  }

  /**
   * Assess skill fit between resource and tasks
   */
  private async assessSkillFit(resource: ResourceProfile, tasks: TaskIntelligence[]): Promise<number> {
    
    let totalSkillFit = 0;
    let totalSkillRequirements = 0;
    
    for (const task of tasks) {
      const taskSkillRequirements = await this.getTaskSkillRequirements(task.id);
      
      for (const skillReq of taskSkillRequirements) {
        totalSkillRequirements++;
        
        const resourceSkill = resource.primary_skills.find(s => s.skill_id === skillReq.skill_id) ||
                             resource.secondary_skills.find(s => s.skill_id === skillReq.skill_id);
        
        if (resourceSkill) {
          // Calculate fit based on proficiency vs requirement
          const proficiencyGap = resourceSkill.proficiency_level - skillReq.required_proficiency_level;
          
          if (proficiencyGap >= 0) {
            // Meets or exceeds requirement
            totalSkillFit += 1.0;
          } else if (proficiencyGap >= -2) {
            // Close enough (learning opportunity)
            totalSkillFit += 0.7;
          } else {
            // Significant gap
            totalSkillFit += 0.3;
          }
        } else {
          // Missing skill entirely
          if (skillReq.is_mandatory) {
            totalSkillFit += 0; // No fit for mandatory missing skills
          } else {
            totalSkillFit += 0.2; // Small penalty for nice-to-have missing skills
          }
        }
      }
    }
    
    return totalSkillRequirements > 0 ? totalSkillFit / totalSkillRequirements : 0.5;
  }

  /**
   * Recommend specific tasks for a resource
   */
  private async recommendSpecificTasks(
    resource: ResourceProfile, 
    tasks: TaskIntelligence[]
  ): Promise<TaskRecommendation[]> {
    
    const taskRecommendations = await Promise.all(
      tasks.map(async task => {
        const fitScore = await this.calculateTaskFitScore(resource, task);
        const learningValue = await this.assessLearningValue(resource, task);
        const completionConfidence = await this.predictCompletionSuccess(resource, task);
        const parallelTasks = await this.findComplementaryTasks(resource, task, tasks);
        
        return {
          task_id: task.id,
          fit_score: fitScore,
          learning_opportunity: learningValue,
          completion_confidence: completionConfidence,
          recommended_parallel_tasks: parallelTasks
        };
      })
    );
    
    // Sort by fit score and return top recommendations
    return taskRecommendations
      .sort((a, b) => b.fit_score - a.fit_score)
      .slice(0, resource.optimal_task_count_per_week);
  }

  /**
   * Calculate overall fit score for a task assignment recommendation
   */
  private calculateTaskFitScore(resource: ResourceProfile, task: TaskIntelligence): Promise<number> {
    
    // Weight different factors
    const weights = {
      complexity_fit: 0.25,
      skill_fit: 0.30,
      work_style_fit: 0.20,
      learning_opportunity: 0.15,
      capacity_fit: 0.10
    };
    
    // Calculate individual scores (simplified for example)
    const complexityFit = this.getComplexityFitForTask(resource, task);
    const skillFit = 0.8; // Would calculate actual skill fit
    const workStyleFit = this.getWorkStyleFitForTask(resource, task);
    const learningOpportunity = 0.6; // Would calculate learning value
    const capacityFit = 0.9; // Would calculate capacity fit
    
    return Promise.resolve(
      complexityFit * weights.complexity_fit +
      skillFit * weights.skill_fit +
      workStyleFit * weights.work_style_fit +
      learningOpportunity * weights.learning_opportunity +
      capacityFit * weights.capacity_fit
    );
  }

  /**
   * Get complexity fit for a specific task
   */
  private getComplexityFitForTask(resource: ResourceProfile, task: TaskIntelligence): number {
    
    const taskComplexity = task.complexity_score;
    const resourceComplexityComfort = resource.complexity_handling_score;
    
    // Perfect fit when task complexity matches resource comfort zone
    const complexityGap = Math.abs(taskComplexity - resourceComplexityComfort);
    
    if (complexityGap <= 1) return 1.0;
    if (complexityGap <= 2) return 0.8;
    if (complexityGap <= 3) return 0.6;
    return 0.4;
  }

  /**
   * Get work style fit for a specific task
   */
  private getWorkStyleFitForTask(resource: ResourceProfile, task: TaskIntelligence): number {
    
    let fit = 0.5; // Base fit
    
    // Adjust based on collaboration requirements
    if (task.collaboration_intensity === 'High' && resource.preferred_work_style === 'Collaborative') {
      fit += 0.3;
    } else if (task.collaboration_intensity === 'Low' && resource.preferred_work_style === 'Deep Focus') {
      fit += 0.3;
    }
    
    // Adjust based on focus requirements
    if (task.requires_deep_focus && resource.preferred_work_style === 'Deep Focus') {
      fit += 0.2;
    }
    
    return Math.min(1.0, fit);
  }

  /**
   * Generate detailed reasoning for assignment recommendation
   */
  private async generateAssignmentReasoning(
    resource: ResourceProfile,
    tasks: TaskIntelligence[],
    capacityFit: TaskCapacityFit,
    skillFit: number,
    riskAssessment: any
  ): Promise<AssignmentReasoning> {
    
    // Generate task matches with reasoning
    const taskMatches = tasks.slice(0, 5).map(task => ({
      task_id: task.id,
      skill_match_score: 0.8, // Would calculate actual skill match
      complexity_fit_score: this.getComplexityFitForTask(resource, task),
      learning_value_score: 0.6, // Would calculate learning value
      reasoning: `Task complexity (${task.complexity_score}) matches resource comfort zone. Good skill alignment.`
    }));
    
    // Generate capacity analysis
    const capacityAnalysis: CapacityAnalysis = {
      current_load: capacityFit.current_capacity_usage,
      optimal_load_range: [70, 90],
      overload_risk: riskAssessment.overload_risk,
      recommendations: [
        'Assign 2-3 medium complexity tasks',
        'Ensure mix of collaborative and focused work',
        'Monitor for context switching impact'
      ]
    };
    
    // Identify potential blockers
    const potentialBlockers = [
      skillFit < 0.6 ? 'Skill gap in required technologies' : null,
      capacityFit.current_capacity_usage > 90 ? 'High current utilization' : null,
      riskAssessment.context_switching_impact > 1.5 ? 'High context switching penalty' : null
    ].filter(Boolean) as string[];
    
    // Calculate success probability
    const successProbability = (skillFit + capacityFit.capacity_fit_score) / 2;
    
    // Generate alternative distributions
    const alternatives: AlternativeTaskDistribution[] = [
      {
        tasks: tasks.slice(0, 2).map(t => t.id),
        expected_outcome: 'High quality completion with minimal stress',
        risk_level: 'Low',
        reasoning: 'Conservative assignment ensuring high success rate'
      },
      {
        tasks: tasks.slice(0, 4).map(t => t.id),
        expected_outcome: 'Good utilization with moderate challenge',
        risk_level: 'Medium',
        reasoning: 'Optimal assignment balancing utilization and growth'
      }
    ];
    
    return {
      task_matches: taskMatches,
      capacity_analysis: capacityAnalysis,
      potential_blockers: potentialBlockers,
      success_probability: successProbability,
      alternative_task_distributions: alternatives
    };
  }

  /**
   * Calculate overall fit score for ranking recommendations
   */
  private calculateOverallFitScore(recommendation: TaskAssignmentRecommendation): number {
    
    // Weighted combination of all factors
    const weights = {
      capacity_fit: 0.25,
      complexity_fit: 0.20,
      skill_fit: 0.20, // Would use actual skill assessment
      quality_prediction: 0.15,
      learning_potential: 0.10,
      collaboration_fit: 0.10
    };
    
    return (
      recommendation.task_capacity_fit.capacity_fit_score * weights.capacity_fit +
      recommendation.complexity_handling_fit * weights.complexity_fit +
      0.8 * weights.skill_fit + // Placeholder for actual skill fit
      (recommendation.quality_prediction / 10) * weights.quality_prediction +
      recommendation.learning_growth_potential * weights.learning_potential +
      recommendation.collaboration_task_fit * weights.collaboration_fit
    );
  }

  // Helper methods (stubs to be implemented with actual data access)
  
  private async getProjectTasks(projectId: string): Promise<TaskIntelligence[]> {
    // Implementation would query database for project tasks
    return [];
  }

  private async getProjectIntelligence(projectId: string): Promise<ProjectIntelligence> {
    // Implementation would query database for project details
    throw new Error('Method not implemented');
  }

  private calculateProjectTaskLoad(tasks: TaskIntelligence[]): number {
    return tasks.reduce((sum, task) => sum + (task.effort_points || 1), 0);
  }

  private getOptimalNewTaskCount(resource: ResourceProfile, tasks: TaskIntelligence[]): number {
    // Calculate optimal number of new tasks based on resource capacity and task complexity
    return Math.min(3, resource.optimal_task_count_per_week - 2);
  }

  private assessTaskSizeDistributionFit(resource: ResourceProfile, tasks: TaskIntelligence[]): number {
    // Assess how well task size distribution matches resource preferences
    return 0.8;
  }

  private async predictPerformanceOutcomes(resource: ResourceProfile, tasks: TaskIntelligence[]): Promise<{
    completion_forecast: number,
    quality_prediction: number,
    learning_potential: number
  }> {
    return {
      completion_forecast: 0.85,
      quality_prediction: 8.2,
      learning_potential: 0.7
    };
  }

  private async assessCollaborationFit(
    resource: ResourceProfile, 
    project: ProjectIntelligence, 
    tasks: TaskIntelligence[]
  ): Promise<{ fit_score: number, transfer_capacity: number }> {
    return {
      fit_score: 0.8,
      transfer_capacity: 0.6
    };
  }

  private async assessAssignmentRisks(resource: ResourceProfile, tasks: TaskIntelligence[]): Promise<{
    overload_risk: 'Low' | 'Medium' | 'High',
    skill_gaps: string[],
    context_switching_impact: number
  }> {
    return {
      overload_risk: 'Low',
      skill_gaps: [],
      context_switching_impact: 0.3
    };
  }

  private async getTaskSkillRequirements(taskId: string): Promise<any[]> {
    // Query database for task skill requirements
    return [];
  }

  private async assessLearningValue(resource: ResourceProfile, task: TaskIntelligence): Promise<number> {
    // Calculate learning opportunity value
    return 0.6;
  }

  private async predictCompletionSuccess(resource: ResourceProfile, task: TaskIntelligence): Promise<number> {
    // Predict likelihood of successful completion
    return 0.85;
  }

  private async findComplementaryTasks(
    resource: ResourceProfile, 
    task: TaskIntelligence, 
    allTasks: TaskIntelligence[]
  ): Promise<string[]> {
    // Find tasks that work well together
    return [];
  }
}