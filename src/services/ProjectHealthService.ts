import { calculateProjectHealth } from '@/utils/phaseCalculations';
import { ProjectTask } from '@/types/project';
import { differenceInDays, isAfter } from 'date-fns';

export interface ProjectHealthData {
  healthScore: number;
  healthStatus: 'green' | 'yellow' | 'red';
  overdueTasks: number;
  overdueMilestones: number;
  criticalTasks: number;
  totalTasks: number;
  completedTasks: number;
}

/**
 * Standardized project health calculation service
 * Single source of truth for all project health metrics
 */
export class ProjectHealthService {
  /**
   * Calculate project health using standardized algorithm
   */
  static async calculateProjectHealthData(
    projectId: string,
    tasks: ProjectTask[] = [],
    milestones: any[] = []
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
        task.endDate &&
        isAfter(today, new Date(task.endDate))
      ).length;

      // Calculate overdue milestones
      const overdueMilestones = milestones.filter(milestone => {
        const progress = this.getMilestoneProgress(milestone, tasks);
        const status = progress === 100 ? 'completed' : milestone.status;
        return status !== 'completed' && 
               milestone.date &&
               isAfter(today, new Date(milestone.date));
      }).length;

      // Calculate critical tasks
      const criticalTasks = tasks.filter(task => 
        (task.priority === 'High' || task.priority === 'Critical') && 
        task.status !== 'Completed'
      ).length;

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
        completedTasks
      };
    } catch (error) {
      console.error('Error calculating project health:', error);
      
      // Fallback calculation if utility function fails
      const today = new Date();
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(task => task.status === 'Completed').length;
      
      const overdueTasks = tasks.filter(task => 
        task.status !== 'Completed' && 
        task.endDate &&
        isAfter(today, new Date(task.endDate))
      ).length;

      const overdueMilestones = milestones.filter(milestone => {
        const progress = this.getMilestoneProgress(milestone, tasks);
        const status = progress === 100 ? 'completed' : milestone.status;
        return status !== 'completed' && 
               milestone.date &&
               isAfter(today, new Date(milestone.date));
      }).length;

      const criticalTasks = tasks.filter(task => 
        (task.priority === 'High' || task.priority === 'Critical') && 
        task.status !== 'Completed'
      ).length;

      // Simple health calculation as fallback
      const healthScore = Math.max(0, 100 - (overdueTasks * 10) - (overdueMilestones * 15) - (criticalTasks * 5));
      const healthStatus: 'green' | 'yellow' | 'red' = 
        healthScore < 60 ? 'red' : healthScore < 80 ? 'yellow' : 'green';

      return {
        healthScore,
        healthStatus,
        overdueTasks,
        overdueMilestones,
        criticalTasks,
        totalTasks,
        completedTasks
      };
    }
  }

  /**
   * Helper function to calculate milestone progress
   */
  private static getMilestoneProgress(milestone: any, tasks: ProjectTask[]): number {
    const milestoneTasks = tasks.filter(task => task.milestoneId === milestone.id);
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