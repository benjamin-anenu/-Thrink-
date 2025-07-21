import { supabase } from "@/integrations/supabase/client";
import { 
  TaskUtilizationMetrics, 
  TaskCapacity, 
  TaskAvailability, 
  UtilizationStatus,
  ResourceProfile,
  TaskIntelligence 
} from "@/types/enhanced-resource";

export class TaskBasedUtilizationEngine {
  async calculateTaskUtilization(
    resourceId: string, 
    windowPeriod: 'day' | 'week' | 'month'
  ): Promise<TaskUtilizationMetrics> {
    const currentTasks = await this.getCurrentTasks(resourceId, windowPeriod);
    const taskCapacity = await this.getTaskCapacity(resourceId, windowPeriod);
    
    const weightedTaskLoad = this.calculateWeightedTaskLoad(currentTasks);
    const weightedCapacity = await this.getWeightedCapacity(resourceId);
    
    return {
      // Core Metrics
      task_count: currentTasks.length,
      task_capacity: taskCapacity.base_capacity,
      utilization_percentage: (currentTasks.length / taskCapacity.base_capacity) * 100,
      
      // Weighted Utilization (considers task complexity)
      weighted_task_load: weightedTaskLoad,
      weighted_capacity: weightedCapacity,
      weighted_utilization: (weightedTaskLoad / weightedCapacity) * 100,
      
      // Task Distribution
      simple_tasks: currentTasks.filter(t => (t.complexity_score || 5) <= 3).length,
      medium_tasks: currentTasks.filter(t => {
        const complexity = t.complexity_score || 5;
        return complexity > 3 && complexity <= 6;
      }).length,
      complex_tasks: currentTasks.filter(t => (t.complexity_score || 5) > 6).length,
      
      // Status Indicators
      status: this.determineUtilizationStatus(currentTasks.length, taskCapacity.base_capacity),
      utilization_trend: await this.calculateTrend(resourceId, windowPeriod),
      optimal_task_range: await this.getOptimalTaskRange(resourceId),
      
      // Predictions
      predicted_completion_count: await this.predictTaskCompletions(resourceId, windowPeriod),
      bottleneck_risk: this.assessBottleneckRisk(resourceId, currentTasks),
      context_switch_penalty: this.calculateContextSwitchPenalty(currentTasks)
    };
  }

  async calculateTaskAvailability(
    resourceId: string, 
    windowPeriod: 'day' | 'week'
  ): Promise<TaskAvailability> {
    const capacity = await this.getTaskCapacity(resourceId, windowPeriod);
    const currentLoad = await this.getCurrentTaskCount(resourceId, windowPeriod);
    
    return {
      available_task_slots: Math.max(0, capacity.base_capacity - currentLoad),
      availability_percentage: Math.max(0, ((capacity.base_capacity - currentLoad) / capacity.base_capacity) * 100),
      
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

  private async getCurrentTasks(resourceId: string, windowPeriod: string): Promise<TaskIntelligence[]> {
    const periodStart = this.getPeriodStart(windowPeriod);
    const periodEnd = this.getPeriodEnd(windowPeriod);
    
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
      .contains('assigned_resources', [resourceId])
      .in('status', ['Pending', 'In Progress', 'Review'])
      .gte('start_date', periodStart)
      .lte('end_date', periodEnd);

    if (error) {
      console.error('Error fetching current tasks:', error);
      return [];
    }

    return data?.map(task => ({
      ...task,
      required_skills: task.task_skill_requirements?.map((req: any) => ({
        ...req,
        skill_name: req.skills?.name || 'Unknown Skill'
      })) || []
    })) || [];
  }

  private async getTaskCapacity(resourceId: string, period: string): Promise<TaskCapacity> {
    // Get resource profile for capacity data
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    if (!profile) {
      // Default capacity if no profile exists
      return {
        base_capacity: period === 'day' ? 3 : period === 'week' ? 15 : 60,
        skill_adjusted_capacity: period === 'day' ? 3 : period === 'week' ? 15 : 60,
        complexity_capacity: {
          simple_tasks_per_period: period === 'day' ? 5 : period === 'week' ? 25 : 100,
          medium_tasks_per_period: period === 'day' ? 3 : period === 'week' ? 15 : 60,
          complex_tasks_per_period: period === 'day' ? 1 : period === 'week' ? 5 : 20
        },
        collaborative_capacity: period === 'day' ? 2 : period === 'week' ? 10 : 40
      };
    }

    const baseCapacity = period === 'day' 
      ? profile.optimal_task_count_per_day 
      : period === 'week' 
        ? profile.optimal_task_count_per_week 
        : profile.optimal_task_count_per_week * 4;

    return {
      base_capacity: baseCapacity,
      skill_adjusted_capacity: await this.adjustForSkillMix(resourceId, baseCapacity),
      complexity_capacity: {
        simple_tasks_per_period: Math.floor(baseCapacity * 1.5),
        medium_tasks_per_period: baseCapacity,
        complex_tasks_per_period: Math.floor(baseCapacity * 0.5)
      },
      collaborative_capacity: Math.floor(baseCapacity * 0.7)
    };
  }

  private calculateWeightedTaskLoad(tasks: TaskIntelligence[]): number {
    return tasks.reduce((total, task) => {
      const complexity = task.complexity_score || 5;
      const urgencyMultiplier = task.priority === 'Critical' ? 1.5 : 
                              task.priority === 'High' ? 1.2 : 1.0;
      const collaborationMultiplier = task.collaboration_intensity === 'High' ? 1.3 :
                                    task.collaboration_intensity === 'Medium' ? 1.1 : 1.0;
      
      return total + (complexity * urgencyMultiplier * collaborationMultiplier);
    }, 0);
  }

  private async getWeightedCapacity(resourceId: string): Promise<number> {
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('*')
      .eq('resource_id', resourceId)
      .single();

    const baseCapacity = profile?.optimal_task_count_per_week || 15;
    const complexityHandling = profile?.complexity_handling_score || 5;
    const collaborationEffectiveness = profile?.collaboration_effectiveness || 0.7;
    
    // Higher complexity handling and collaboration effectiveness increase weighted capacity
    return baseCapacity * (complexityHandling / 5) * (1 + collaborationEffectiveness);
  }

  private determineUtilizationStatus(currentTasks: number, capacity: number): UtilizationStatus {
    const utilization = (currentTasks / capacity) * 100;
    
    if (utilization > 120) return 'Severely Overloaded';
    if (utilization > 100) return 'Overloaded';
    if (utilization > 85) return 'Optimally Loaded';
    if (utilization > 60) return 'Well Utilized';
    if (utilization > 30) return 'Moderately Utilized';
    return 'Underutilized';
  }

  private async calculateTrend(resourceId: string, windowPeriod: string): Promise<number> {
    const currentPeriod = await this.getCurrentTaskCount(resourceId, windowPeriod);
    const previousPeriod = await this.getPreviousPeriodTaskCount(resourceId, windowPeriod);
    
    if (previousPeriod === 0) return 0;
    return ((currentPeriod - previousPeriod) / previousPeriod) * 100;
  }

  private async getOptimalTaskRange(resourceId: string): Promise<[number, number]> {
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('optimal_task_count_per_week')
      .eq('resource_id', resourceId)
      .single();

    const optimal = profile?.optimal_task_count_per_week || 15;
    return [Math.floor(optimal * 0.8), Math.floor(optimal * 1.2)];
  }

  private async getCurrentTaskCount(resourceId: string, windowPeriod: string): Promise<number> {
    const tasks = await this.getCurrentTasks(resourceId, windowPeriod);
    return tasks.length;
  }

  private async getPreviousPeriodTaskCount(resourceId: string, windowPeriod: string): Promise<number> {
    // Implementation would fetch tasks from previous period
    // For now, return 0 to avoid errors
    return 0;
  }

  private async adjustForSkillMix(resourceId: string, baseCapacity: number): Promise<number> {
    // Get resource's skill proficiencies
    const { data: skills } = await supabase
      .from('skill_proficiencies')
      .select('proficiency_level')
      .eq('resource_id', resourceId);

    if (!skills || skills.length === 0) return baseCapacity;

    const averageProficiency = skills.reduce((sum, skill) => sum + skill.proficiency_level, 0) / skills.length;
    const skillMultiplier = averageProficiency / 5; // Normalize to 1.0 at average proficiency of 5

    return Math.floor(baseCapacity * skillMultiplier);
  }

  private assessBottleneckRisk(resourceId: string, tasks: TaskIntelligence[]): number {
    // Calculate bottleneck risk based on task dependencies and critical path involvement
    const highDependencyTasks = tasks.filter(task => (task.dependency_weight || 1) > 5);
    const complexTasks = tasks.filter(task => (task.complexity_score || 5) > 7);
    
    const riskScore = (highDependencyTasks.length * 3) + (complexTasks.length * 2);
    return Math.min(riskScore, 10); // Cap at 10
  }

  private calculateContextSwitchPenalty(tasks: TaskIntelligence[]): number {
    if (tasks.length <= 1) return 0;
    
    // Calculate penalty based on number of tasks and their context switching requirements
    const highSwitchingPenalty = tasks.filter(task => (task.context_switching_penalty || 5) > 7).length;
    const totalTasks = tasks.length;
    
    return Math.min((totalTasks - 1) * 0.1 + (highSwitchingPenalty * 0.2), 1.0);
  }

  private async predictTaskCompletions(resourceId: string, windowPeriod: string): Promise<number> {
    // Simple prediction based on historical velocity
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('historical_task_velocity')
      .eq('resource_id', resourceId)
      .single();

    const velocity = profile?.historical_task_velocity || 0.8;
    const currentTasks = await this.getCurrentTaskCount(resourceId, windowPeriod);
    
    return Math.floor(currentTasks * velocity);
  }

  private async getAvailableSlots(resourceId: string, complexity: 'simple' | 'medium' | 'complex'): Promise<number> {
    const capacity = await this.getTaskCapacity(resourceId, 'week');
    const currentTasks = await this.getCurrentTasks(resourceId, 'week');
    
    const currentByComplexity = {
      simple: currentTasks.filter(t => (t.complexity_score || 5) <= 3).length,
      medium: currentTasks.filter(t => {
        const score = t.complexity_score || 5;
        return score > 3 && score <= 6;
      }).length,
      complex: currentTasks.filter(t => (t.complexity_score || 5) > 6).length
    };

    const capacityByComplexity = {
      simple: capacity.complexity_capacity.simple_tasks_per_period,
      medium: capacity.complexity_capacity.medium_tasks_per_period,
      complex: capacity.complexity_capacity.complex_tasks_per_period
    };

    return Math.max(0, capacityByComplexity[complexity] - currentByComplexity[complexity]);
  }

  private async getRecommendedNewTaskCount(resourceId: string): Promise<number> {
    const availability = await this.calculateTaskAvailability(resourceId, 'week');
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('task_switching_preference, optimal_task_count_per_week')
      .eq('resource_id', resourceId)
      .single();

    const availableSlots = availability.available_task_slots;
    const preference = profile?.task_switching_preference || 'Sequential';
    
    // Adjust recommendation based on switching preference
    if (preference === 'Sequential') {
      return Math.min(availableSlots, 2); // Prefer fewer new tasks
    } else if (preference === 'Parallel') {
      return Math.min(availableSlots, 5); // Can handle more tasks
    } else {
      return Math.min(availableSlots, 3); // Balanced approach
    }
  }

  private async assessContextSwitchImpact(resourceId: string): Promise<number> {
    const currentTasks = await this.getCurrentTasks(resourceId, 'week');
    const { data: profile } = await supabase
      .from('resource_profiles')
      .select('task_switching_penalty_score')
      .eq('resource_id', resourceId)
      .single();

    const penaltyScore = profile?.task_switching_penalty_score || 5;
    const taskCount = currentTasks.length;
    
    // Higher task count and penalty score increase impact
    return Math.min((taskCount * penaltyScore) / 50, 1.0);
  }

  private async predictNextPeriodAvailability(resourceId: string, windowPeriod: string): Promise<number> {
    // Simple prediction - assume some tasks will complete
    const currentAvailability = await this.calculateTaskAvailability(resourceId, windowPeriod);
    const completionRate = 0.7; // Assume 70% of tasks complete each period
    
    return Math.min(currentAvailability.available_task_slots + 
                   (currentAvailability.available_task_slots * completionRate), 100);
  }

  private async forecastTaskCompletions(resourceId: string, windowPeriod: string): Promise<number> {
    return this.predictTaskCompletions(resourceId, windowPeriod);
  }

  private getPeriodStart(windowPeriod: string): string {
    const now = new Date();
    switch (windowPeriod) {
      case 'day':
        return now.toISOString().split('T')[0];
      case 'week':
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return startOfWeek.toISOString().split('T')[0];
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      default:
        return now.toISOString().split('T')[0];
    }
  }

  private getPeriodEnd(windowPeriod: string): string {
    const now = new Date();
    switch (windowPeriod) {
      case 'day':
        return now.toISOString().split('T')[0];
      case 'week':
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return endOfWeek.toISOString().split('T')[0];
      case 'month':
        return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      default:
        return now.toISOString().split('T')[0];
    }
  }
}

export const taskUtilizationEngine = new TaskBasedUtilizationEngine();