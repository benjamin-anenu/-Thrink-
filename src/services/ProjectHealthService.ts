import { calculateProjectHealth } from '@/utils/phaseCalculations';
import { ProjectTask, ProjectData } from '@/types/project';
import { differenceInDays, isAfter } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectHealthData {
  healthScore: number;
  healthStatus: 'green' | 'yellow' | 'red';
  overdueTasks: number;
  overdueMilestones: number;
  criticalTasks: number;
  totalTasks: number;
  completedTasks: number;
  healthBreakdown: {
    timeline: 'green' | 'yellow' | 'red';
    budget: 'green' | 'yellow' | 'red';
    resources: 'green' | 'yellow' | 'red';
    quality: 'green' | 'yellow' | 'red';
  };
}

/**
 * Enhanced project health calculation service
 * Single source of truth for all project health metrics across the application
 * Real-time health calculation with consistent scoring
 */
export class ProjectHealthService {
  /**
   * Real-time project health calculation - PRIMARY METHOD
   * This is the single source of truth for project health across all views
   */
  static async calculateRealTimeProjectHealth(projectId: string): Promise<ProjectHealthData> {
    try {
      // Fetch project data and related entities
      const [projectResult, tasksResult, milestonesResult, budgetResult] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('project_tasks').select('*').eq('project_id', projectId),
        supabase.from('milestones').select('*').eq('project_id', projectId),
        supabase.from('project_budgets').select('*').eq('project_id', projectId)
      ]);

      const project = projectResult.data;
      const tasks = tasksResult.data || [];
      const milestones = milestonesResult.data || [];
      const budgets = budgetResult.data || [];

      return this.calculateProjectHealthFromData(projectId, tasks, milestones, budgets, project);
    } catch (error) {
      console.error('Error calculating real-time project health:', error);
      return this.getFallbackHealth();
    }
  }

  /**
   * Calculate project health from provided data (for performance optimization)
   */
  static async calculateProjectHealthFromData(
    projectId: string,
    tasks: any[] = [],
    milestones: any[] = [],
    budgets: any[] = [],
    project: any = null
  ): Promise<ProjectHealthData> {
    try {
      // Use the utility function for comprehensive health calculation
      const projectHealth = await calculateProjectHealth(projectId);
      
      // Calculate additional metrics from task data
      const today = new Date();
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      
      // Calculate overdue tasks
      const overdueTasks = tasks.filter(task => 
        task.status !== 'Completed' && 
        task.end_date &&
        isAfter(today, new Date(task.end_date))
      ).length;

      // Calculate overdue milestones
      const overdueMilestones = milestones.filter(milestone => {
        const progress = this.getMilestoneProgress(milestone, tasks);
        const status = progress === 100 ? 'completed' : milestone.status;
        return status !== 'completed' && 
               milestone.due_date &&
               isAfter(today, new Date(milestone.due_date));
      }).length;

      // Calculate critical tasks
      const criticalTasks = tasks.filter(task => 
        (task.priority === 'High' || task.priority === 'Critical') && 
        task.status !== 'Completed'
      ).length;

      // Calculate health breakdown
      const healthBreakdown = this.calculateHealthBreakdown(tasks, milestones, budgets, project);

      // Map health status to color
      const healthStatus = projectHealth.status === 'green' ? 'green' :
                          projectHealth.status === 'yellow' ? 'yellow' : 'red';

      return {
        healthScore: Math.round(projectHealth.score || 0),
        healthStatus,
        overdueTasks,
        overdueMilestones,
        criticalTasks,
        totalTasks,
        completedTasks,
        healthBreakdown
      };
    } catch (error) {
      console.error('Error calculating project health:', error);
      return this.getFallbackHealth();
    }
  }

  /**
   * Calculate health breakdown by category
   */
  private static calculateHealthBreakdown(
    tasks: any[], 
    milestones: any[], 
    budgets: any[], 
    project: any
  ): ProjectHealthData['healthBreakdown'] {
    const today = new Date();
    
    // Timeline health
    const overdueTasks = tasks.filter(task => 
      task.status !== 'Completed' && 
      task.end_date &&
      isAfter(today, new Date(task.end_date))
    ).length;
    const timelineHealth = overdueTasks === 0 ? 'green' : 
                          overdueTasks <= 2 ? 'yellow' : 'red';

    // Budget health
    const totalBudget = budgets?.reduce((sum, budget) => sum + Number(budget.allocated_amount || 0), 0) || 0;
    const totalSpent = budgets?.reduce((sum, budget) => sum + Number(budget.spent_amount || 0), 0) || 0;
    const budgetUsage = totalBudget > 0 ? (totalSpent / totalBudget) : 0;
    const budgetHealth = budgetUsage <= 0.8 ? 'green' : 
                        budgetUsage <= 0.95 ? 'yellow' : 'red';

    // Resource health
    const criticalTasks = tasks.filter(task => 
      (task.priority === 'High' || task.priority === 'Critical') && 
      task.status !== 'Completed'
    ).length;
    const resourceHealth = criticalTasks === 0 ? 'green' : 
                          criticalTasks <= 2 ? 'yellow' : 'red';

    // Quality health (based on task completion rate)
    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const completionRate = tasks.length > 0 ? completedTasks / tasks.length : 1;
    const qualityHealth = completionRate >= 0.8 ? 'green' : 
                         completionRate >= 0.6 ? 'yellow' : 'red';

    return {
      timeline: timelineHealth,
      budget: budgetHealth,
      resources: resourceHealth,
      quality: qualityHealth
    };
  }

  /**
   * Get fallback health data when calculation fails
   */
  private static getFallbackHealth(): ProjectHealthData {
    return {
      healthScore: 50,
      healthStatus: 'yellow',
      overdueTasks: 0,
      overdueMilestones: 0,
      criticalTasks: 0,
      totalTasks: 0,
      completedTasks: 0,
      healthBreakdown: {
        timeline: 'yellow',
        budget: 'yellow',
        resources: 'yellow',
        quality: 'yellow'
      }
    };
  }

  /**
   * Legacy method for backward compatibility
   */
  static async calculateProjectHealthData(
    projectId: string,
    tasks: ProjectTask[] = [],
    milestones: any[] = []
  ): Promise<ProjectHealthData> {
    return this.calculateRealTimeProjectHealth(projectId);
  }

  /**
   * Helper function to calculate milestone progress
   */
  private static getMilestoneProgress(milestone: any, tasks: any[]): number {
    const milestoneTasks = tasks.filter(task => task.milestone_id === milestone.id);
    if (milestoneTasks.length === 0) return 0;
    
    const completedMilestoneTasks = milestoneTasks.filter(task => task.status === 'Completed').length;
    return Math.round((completedMilestoneTasks / milestoneTasks.length) * 100);
  }

  /**
   * Get health description for UI display
   */
  static getHealthDescription(healthStatus: 'green' | 'yellow' | 'red'): string {
    switch (healthStatus) {
      case 'green':
        return 'Healthy';
      case 'yellow':
        return 'Caution';
      case 'red':
        return 'At Risk';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get health color classes for UI styling
   */
  static getHealthColorClass(healthStatus: 'green' | 'yellow' | 'red'): string {
    switch (healthStatus) {
      case 'green':
        return 'text-green-500';
      case 'yellow':
        return 'text-yellow-500';
      case 'red':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  }

  /**
   * Get badge variant for health status
   */
  static getHealthBadgeVariant(healthStatus: 'green' | 'yellow' | 'red'): 'default' | 'secondary' | 'destructive' {
    switch (healthStatus) {
      case 'green':
        return 'default';
      case 'yellow':
        return 'secondary';
      case 'red':
        return 'destructive';
      default:
        return 'secondary';
    }
  }
}