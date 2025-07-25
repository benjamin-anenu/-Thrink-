import { 
  ResourceProfile, 
  TaskUtilizationMetrics, 
  TaskCapacity, 
  TaskAvailability,
  UtilizationStatus,
  ComplexityCapacityBreakdown 
} from '../types/ResourceProfile';
import { TaskIntelligence } from '../types/TaskIntelligence';

export class TaskBasedUtilizationEngine {
  
  /**
   * Calculate comprehensive task-based utilization metrics for a resource
   */
  async calculateTaskUtilization(
    resourceId: string, 
    windowPeriod: 'day' | 'week' | 'month'
  ): Promise<TaskUtilizationMetrics> {
    
    const currentTasks = await this.getCurrentTasks(resourceId, windowPeriod);
    const taskCapacity = await this.getTaskCapacity(resourceId, windowPeriod);
    const weightedLoad = this.calculateWeightedTaskLoad(currentTasks);
    const weightedCapacity = await this.getWeightedCapacity(resourceId);
    
    return {
      // Core Metrics
      task_count: currentTasks.length,
      task_capacity: taskCapacity.base_capacity,
      utilization_percentage: (currentTasks.length / taskCapacity.base_capacity) * 100,
      
      // Weighted Utilization (considers task complexity)
      weighted_task_load: weightedLoad,
      weighted_capacity: weightedCapacity,
      weighted_utilization: (weightedLoad / weightedCapacity) * 100,
      
      // Task Distribution
      simple_tasks: currentTasks.filter(t => t.complexity_score <= 3).length,
      medium_tasks: currentTasks.filter(t => t.complexity_score > 3 && t.complexity_score <= 6).length,
      complex_tasks: currentTasks.filter(t => t.complexity_score > 6).length,
      
      // Status Indicators
      status: this.determineUtilizationStatus(currentTasks.length, taskCapacity.base_capacity),
      utilization_trend: await this.calculateTrend(resourceId, windowPeriod),
      optimal_task_range: await this.getOptimalTaskRange(resourceId, windowPeriod),
      
      // Predictions
      predicted_completion_count: await this.predictTaskCompletions(resourceId, windowPeriod),
      bottleneck_risk: await this.assessBottleneckRisk(resourceId, currentTasks),
      context_switch_penalty: this.calculateContextSwitchPenalty(currentTasks)
    };
  }

  /**
   * Calculate weighted task load considering complexity and urgency
   */
  private calculateWeightedTaskLoad(tasks: TaskIntelligence[]): number {
    return tasks.reduce((total, task) => {
      const complexity = task.complexity_score || 5;
      const urgencyMultiplier = this.getUrgencyMultiplier(task.priority);
      const focusMultiplier = task.requires_deep_focus ? 1.3 : 1.0;
      const collaborationMultiplier = this.getCollaborationMultiplier(task.collaboration_intensity);
      
      return total + (complexity * urgencyMultiplier * focusMultiplier * collaborationMultiplier);
    }, 0);
  }

  /**
   * Get urgency multiplier based on task priority
   */
  private getUrgencyMultiplier(priority: string): number {
    const multipliers = {
      'Critical': 1.5,
      'High': 1.2,
      'Medium': 1.0,
      'Low': 0.8
    };
    return multipliers[priority as keyof typeof multipliers] || 1.0;
  }

  /**
   * Get collaboration multiplier based on collaboration intensity
   */
  private getCollaborationMultiplier(intensity: string): number {
    const multipliers = {
      'High': 1.4,
      'Medium': 1.1,
      'Low': 1.0
    };
    return multipliers[intensity as keyof typeof multipliers] || 1.1;
  }

  /**
   * Calculate AI-learned task capacity based on historical performance
   */
  private async getTaskCapacity(resourceId: string, period: string): Promise<TaskCapacity> {
    const resourceProfile = await this.getResourceProfile(resourceId);
    const historicalData = await this.getHistoricalTaskCompletion(resourceId);
    const skillProfile = await this.getResourceSkillProfile(resourceId);
    
    const baseCapacity = this.calculateBaseCapacity(resourceProfile, historicalData, period);
    const skillAdjustedCapacity = this.adjustForSkillMix(baseCapacity, skillProfile);
    const complexityCapacity = await this.calculateComplexityCapacity(resourceId, period);
    const collaborativeCapacity = await this.getCollaborativeCapacity(resourceId, period);
    
    return {
      base_capacity: baseCapacity,
      skill_adjusted_capacity: skillAdjustedCapacity,
      complexity_capacity: complexityCapacity,
      collaborative_capacity: collaborativeCapacity
    };
  }

  /**
   * Calculate base capacity from resource profile and historical data
   */
  private calculateBaseCapacity(
    resource: ResourceProfile, 
    historicalData: any[], 
    period: string
  ): number {
    
    // Start with resource's self-reported optimal capacity
    let baseCapacity = period === 'day' 
      ? resource.optimal_task_count_per_day 
      : resource.optimal_task_count_per_week;
    
    // Adjust based on historical performance
    if (historicalData.length > 0) {
      const avgHistoricalCompletion = historicalData.reduce((sum, data) => 
        sum + data.tasks_completed, 0) / historicalData.length;
      
      // Blend self-reported with historical (70% historical, 30% self-reported)
      baseCapacity = (avgHistoricalCompletion * 0.7) + (baseCapacity * 0.3);
    }
    
    // Adjust for work days if not full-time
    if (resource.employment_type !== 'Full-time') {
      const adjustmentFactors = {
        'Part-time': 0.6,
        'Contract': 0.8,
        'Consultant': 0.7
      };
      baseCapacity *= adjustmentFactors[resource.employment_type as keyof typeof adjustmentFactors] || 1.0;
    }
    
    // Adjust for recurring commitments
    const commitmentImpact = resource.recurring_commitments.reduce(
      (total, commitment) => total + commitment.task_capacity_impact, 0
    );
    
    return Math.max(1, Math.round(baseCapacity - commitmentImpact));
  }

  /**
   * Calculate complexity-specific capacity breakdown
   */
  private async calculateComplexityCapacity(
    resourceId: string, 
    period: string
  ): Promise<ComplexityCapacityBreakdown> {
    
    const resource = await this.getResourceProfile(resourceId);
    const baseCapacity = await this.getTaskCapacity(resourceId, period);
    
    // Use resource's optimal complexity mix to distribute capacity
    const simpleCapacity = Math.round(baseCapacity.base_capacity * resource.optimal_task_complexity_mix.simple_tasks_percentage);
    const mediumCapacity = Math.round(baseCapacity.base_capacity * resource.optimal_task_complexity_mix.medium_tasks_percentage);
    const complexCapacity = Math.round(baseCapacity.base_capacity * resource.optimal_task_complexity_mix.complex_tasks_percentage);
    
    return {
      simple_tasks_per_period: simpleCapacity,
      medium_tasks_per_period: mediumCapacity,
      complex_tasks_per_period: complexCapacity
    };
  }

  /**
   * Determine utilization status based on current load vs capacity
   */
  private determineUtilizationStatus(currentTasks: number, capacity: number): UtilizationStatus {
    const utilization = (currentTasks / capacity) * 100;
    
    if (utilization > 120) return 'Severely Overloaded';
    if (utilization > 100) return 'Overloaded';
    if (utilization > 85) return 'Optimally Loaded';
    if (utilization > 60) return 'Well Utilized';
    if (utilization > 30) return 'Moderately Utilized';
    return 'Underutilized';
  }

  /**
   * Calculate task availability with smart recommendations
   */
  async calculateTaskAvailability(
    resourceId: string, 
    windowPeriod: 'day' | 'week'
  ): Promise<TaskAvailability> {
    
    const capacity = await this.getTaskCapacity(resourceId, windowPeriod);
    const currentLoad = await this.getCurrentTaskCount(resourceId, windowPeriod);
    const availableSlots = Math.max(0, capacity.base_capacity - currentLoad);
    
    return {
      available_task_slots: availableSlots,
      availability_percentage: availableSlots > 0 ? (availableSlots / capacity.base_capacity) * 100 : 0,
      
      // Granular availability by task type
      simple_task_slots_available: await this.getAvailableSlots(resourceId, 'simple'),
      medium_task_slots_available: await this.getAvailableSlots(resourceId, 'medium'),
      complex_task_slots_available: await this.getAvailableSlots(resourceId, 'complex'),
      
      // Smart availability considering context switching
      recommended_new_tasks: await this.getRecommendedNewTaskCount(resourceId),
      context_switch_impact: await this.assessContextSwitchImpact(resourceId),
      
      // Future availability prediction
      next_period_availability: await this.predictNextPeriodAvailability(resourceId, windowPeriod),
      task_completion_forecast: await this.forecastTaskCompletions(resourceId, windowPeriod)
    };
  }

  /**
   * Calculate context switching penalty for current task load
   */
  private calculateContextSwitchPenalty(tasks: TaskIntelligence[]): number {
    if (tasks.length <= 1) return 0;
    
    // Calculate penalty based on:
    // 1. Number of different projects
    // 2. Variety of task types/complexity
    // 3. Context switching requirements
    
    const uniqueProjects = new Set(tasks.map(t => t.project_id)).size;
    const complexityVariance = this.calculateComplexityVariance(tasks);
    const deepFocusTasks = tasks.filter(t => t.requires_deep_focus).length;
    
    // Base penalty increases with number of tasks
    let penalty = Math.min(tasks.length * 0.1, 1.0);
    
    // Additional penalty for cross-project context switching
    penalty += (uniqueProjects - 1) * 0.15;
    
    // Penalty for complexity variance
    penalty += complexityVariance * 0.1;
    
    // Higher penalty for deep focus tasks when multitasking
    if (deepFocusTasks > 0 && tasks.length > deepFocusTasks) {
      penalty += deepFocusTasks * 0.2;
    }
    
    return Math.min(penalty, 2.0); // Cap at 2.0 (200% penalty)
  }

  /**
   * Calculate complexity variance in current task set
   */
  private calculateComplexityVariance(tasks: TaskIntelligence[]): number {
    if (tasks.length <= 1) return 0;
    
    const complexities = tasks.map(t => t.complexity_score);
    const mean = complexities.reduce((sum, c) => sum + c, 0) / complexities.length;
    const variance = complexities.reduce((sum, c) => sum + Math.pow(c - mean, 2), 0) / complexities.length;
    
    return Math.sqrt(variance) / 10; // Normalize to 0-1 scale
  }

  /**
   * Predict task completions for the given period
   */
  private async predictTaskCompletions(
    resourceId: string, 
    windowPeriod: 'day' | 'week' | 'month'
  ): Promise<number> {
    
    const resource = await this.getResourceProfile(resourceId);
    const historicalVelocity = resource.historical_task_velocity;
    const currentTasks = await this.getCurrentTasks(resourceId, windowPeriod);
    
    // Adjust prediction based on current task complexity
    const avgCurrentComplexity = currentTasks.reduce((sum, task) => 
      sum + task.complexity_score, 0) / Math.max(currentTasks.length, 1);
    
    // Complexity adjustment factor (harder tasks = lower completion rate)
    const complexityAdjustment = Math.max(0.3, 1.2 - (avgCurrentComplexity / 10));
    
    // Context switching penalty
    const contextPenalty = this.calculateContextSwitchPenalty(currentTasks);
    const contextAdjustment = Math.max(0.5, 1.0 - (contextPenalty * 0.3));
    
    let predictedCompletions = historicalVelocity * complexityAdjustment * contextAdjustment;
    
    // Adjust for period
    if (windowPeriod === 'day') {
      predictedCompletions = predictedCompletions / 5; // Assume 5 work days per week
    } else if (windowPeriod === 'month') {
      predictedCompletions = predictedCompletions * 4.33; // ~4.33 weeks per month
    }
    
    return Math.round(Math.max(0, predictedCompletions));
  }

  /**
   * Assess bottleneck risk based on current task load and capacity
   */
  private async assessBottleneckRisk(
    resourceId: string, 
    currentTasks: TaskIntelligence[]
  ): Promise<'Low' | 'Medium' | 'High'> {
    
    const capacity = await this.getTaskCapacity(resourceId, 'week');
    const utilization = currentTasks.length / capacity.base_capacity;
    
    // Check for blocking tasks
    const blockingTasks = currentTasks.filter(task => task.dependency_weight > 5);
    
    // Check for overdue tasks
    const overdueTasks = currentTasks.filter(task => 
      task.status === 'In Progress' && 
      new Date() > new Date(task.completed_at || Date.now())
    );
    
    // Calculate risk score
    let riskScore = 0;
    
    // Utilization risk
    if (utilization > 1.2) riskScore += 3;
    else if (utilization > 1.0) riskScore += 2;
    else if (utilization > 0.8) riskScore += 1;
    
    // Blocking tasks risk
    riskScore += blockingTasks.length;
    
    // Overdue tasks risk
    riskScore += overdueTasks.length * 2;
    
    // Complex task risk
    const complexTasks = currentTasks.filter(t => t.complexity_score > 7);
    riskScore += complexTasks.length;
    
    if (riskScore >= 5) return 'High';
    if (riskScore >= 2) return 'Medium';
    return 'Low';
  }

  // Helper methods for data retrieval (to be implemented with actual data layer)
  
  private async getCurrentTasks(resourceId: string, period: string): Promise<TaskIntelligence[]> {
    // Implementation would query the database for current tasks
    // This is a placeholder that would be replaced with actual data access
    return [];
  }

  private async getCurrentTaskCount(resourceId: string, period: string): Promise<number> {
    const tasks = await this.getCurrentTasks(resourceId, period);
    return tasks.length;
  }

  private async getResourceProfile(resourceId: string): Promise<ResourceProfile> {
    // Implementation would query the database for resource profile
    // This is a placeholder
    throw new Error('Method not implemented - requires database integration');
  }

  private async getHistoricalTaskCompletion(resourceId: string): Promise<any[]> {
    // Implementation would query historical completion data
    return [];
  }

  private async getResourceSkillProfile(resourceId: string): Promise<any> {
    // Implementation would query skill proficiency data
    return {};
  }

  private async getWeightedCapacity(resourceId: string): Promise<number> {
    // Implementation would calculate weighted capacity based on skills and preferences
    return 10;
  }

  private adjustForSkillMix(baseCapacity: number, skillProfile: any): number {
    // Adjust capacity based on skill diversity and proficiency
    return baseCapacity;
  }

  private async getCollaborativeCapacity(resourceId: string, period: string): Promise<number> {
    // Calculate capacity for collaborative tasks
    return 5;
  }

  private async calculateTrend(resourceId: string, period: string): Promise<'Increasing' | 'Stable' | 'Decreasing'> {
    // Analyze historical utilization trends
    return 'Stable';
  }

  private async getOptimalTaskRange(resourceId: string, period: string): Promise<[number, number]> {
    const resource = await this.getResourceProfile(resourceId);
    const base = period === 'day' ? resource.optimal_task_count_per_day : resource.optimal_task_count_per_week;
    return [Math.max(1, base - 2), base + 2];
  }

  private async getAvailableSlots(resourceId: string, complexity: string): Promise<number> {
    // Calculate available slots for specific complexity level
    return 2;
  }

  private async getRecommendedNewTaskCount(resourceId: string): Promise<number> {
    // Calculate recommended number of new tasks considering context switching
    return 1;
  }

  private async assessContextSwitchImpact(resourceId: string): Promise<number> {
    // Assess impact of context switching on performance
    return 0.1;
  }

  private async predictNextPeriodAvailability(resourceId: string, period: string): Promise<number> {
    // Predict availability for next period
    return 3;
  }

  private async forecastTaskCompletions(resourceId: string, period: string): Promise<number> {
    // Forecast how many tasks will be completed
    return 2;
  }
}