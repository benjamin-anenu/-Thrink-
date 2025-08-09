import { supabase } from '@/integrations/supabase/client';

export interface BudgetStatus {
  planned_cost: number;
  budget_ratio: number;
  budget_health: number;
  status: 'Healthy' | 'At Risk' | 'Critical';
}

export interface ProjectBudgetInputs {
  resource_count: number;
  rate_per_day: number;
  duration_days: number;
  project_budget: number;
}

/**
 * Single Source-of-Truth Budget Status Engine
 * Implements the core budget logic for all budget-related calculations
 */
export class BudgetStatusEngine {
  private static clamp(x: number): number {
    return Math.min(Math.max(x, 0), 1);
  }

  /**
   * Core budget status calculation
   * @param R - Number of resources
   * @param ratePerDay - Rate per resource per day
   * @param durationDays - Planned duration in days
   * @param budget - Total project budget
   */
  static computeBudgetStatus(R: number, ratePerDay: number, durationDays: number, budget: number): BudgetStatus {
    // 1. Calculate planned cost
    const plannedCost = R * ratePerDay * durationDays;
    
    // 2. Ratio of plan vs. budget
    const ratio = budget > 0 ? plannedCost / budget : 0;
    
    // 3. Normalize health (1.0 if under budget; drops toward 0 if over)
    const overRatio = Math.max(0, ratio - 1); // how far past budget
    const health = this.clamp(1 - overRatio);
    
    // 4. Derive status
    let status: 'Healthy' | 'At Risk' | 'Critical';
    if (health >= 0.80) {
      status = 'Healthy';
    } else if (health >= 0.50) {
      status = 'At Risk';
    } else {
      status = 'Critical';
    }
    
    return {
      planned_cost: plannedCost,
      budget_ratio: Math.round(ratio * 100) / 100,
      budget_health: Math.round(health * 100) / 100,
      status
    };
  }

  /**
   * Get project budget inputs from database
   */
  static async getProjectBudgetInputs(projectId: string): Promise<ProjectBudgetInputs> {
    try {
      // Get project data - simplified query
      const projectResult = await supabase
        .from('projects')
        .select('resources, start_date, end_date, computed_start_date, computed_end_date')
        .eq('id', projectId)
        .single();

      // Get budget data
      const budgetResult = await supabase
        .from('project_budgets')
        .select('allocated_amount')
        .eq('project_id', projectId);

      const project = projectResult.data;
      const budgets = budgetResult.data || [];

      // Calculate inputs with safer type handling
      let resourceCount = 1;
      if (project?.resources && Array.isArray(project.resources)) {
        resourceCount = project.resources.length;
      }
      
      // Use computed dates if available, otherwise use planned dates
      const startDateStr = project?.computed_start_date || project?.start_date;
      const endDateStr = project?.computed_end_date || project?.end_date;
      
      const startDate = startDateStr ? new Date(startDateStr) : new Date();
      const endDate = endDateStr ? new Date(endDateStr) : new Date();
      const durationDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      
      const projectBudget = budgets.reduce((sum, b) => sum + Number(b.allocated_amount || 0), 0);
      
      // Default rate per day (can be made configurable)
      const ratePerDay = 500; // $500 per resource per day default
      
      return {
        resource_count: resourceCount,
        rate_per_day: ratePerDay,
        duration_days: durationDays,
        project_budget: projectBudget
      };
    } catch (error) {
      console.error('Error getting project budget inputs:', error);
      return {
        resource_count: 1,
        rate_per_day: 500,
        duration_days: 30,
        project_budget: 15000
      };
    }
  }

  /**
   * Calculate budget status for a specific project
   */
  static async calculateProjectBudgetStatus(projectId: string): Promise<BudgetStatus> {
    const inputs = await this.getProjectBudgetInputs(projectId);
    return this.computeBudgetStatus(
      inputs.resource_count,
      inputs.rate_per_day,
      inputs.duration_days,
      inputs.project_budget
    );
  }

  /**
   * Calculate budget health score (0-100) for compatibility with existing code
   */
  static async getProjectBudgetHealth(projectId: string): Promise<number> {
    const status = await this.calculateProjectBudgetStatus(projectId);
    return Math.round(status.budget_health * 100);
  }

  /**
   * Get budget status for workspace (aggregated across projects)
   */
  static async calculateWorkspaceBudgetStatus(workspaceId: string): Promise<BudgetStatus> {
    try {
      // Get all projects in workspace
      const { data: projects } = await supabase
        .from('projects')
        .select('id')
        .eq('workspace_id', workspaceId);

      if (!projects || projects.length === 0) {
        return {
          planned_cost: 0,
          budget_ratio: 0,
          budget_health: 1,
          status: 'Healthy'
        };
      }

      // Calculate status for each project
      const projectStatuses = await Promise.all(
        projects.map(p => this.calculateProjectBudgetStatus(p.id))
      );

      // Aggregate results
      const totalPlannedCost = projectStatuses.reduce((sum, s) => sum + s.planned_cost, 0);
      const weightedHealth = projectStatuses.reduce((sum, s) => sum + (s.budget_health * s.planned_cost), 0);
      const avgHealth = totalPlannedCost > 0 ? weightedHealth / totalPlannedCost : 1;
      
      // Overall status based on worst project
      const worstStatus = projectStatuses.reduce((worst, current) => {
        const statusOrder = { 'Healthy': 0, 'At Risk': 1, 'Critical': 2 };
        return statusOrder[current.status] > statusOrder[worst.status] ? current : worst;
      }, projectStatuses[0]);

      return {
        planned_cost: totalPlannedCost,
        budget_ratio: 0, // Not meaningful at workspace level
        budget_health: avgHealth,
        status: worstStatus.status
      };
    } catch (error) {
      console.error('Error calculating workspace budget status:', error);
      return {
        planned_cost: 0,
        budget_ratio: 0,
        budget_health: 1,
        status: 'Healthy'
      };
    }
  }
}