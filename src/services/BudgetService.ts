
import { supabase } from '@/integrations/supabase/client';

export interface BudgetData {
  id: string;
  projectId: string;
  budgetCategory: string;
  allocatedAmount: number;
  spentAmount: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  utilizationRate: number;
  currency: string;
}

class BudgetService {
  async addBudgetEntry(data: Omit<BudgetData, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data: result, error } = await supabase
      .from('project_budgets')
      .insert({
        project_id: data.projectId,
        budget_category: data.budgetCategory,
        allocated_amount: data.allocatedAmount,
        spent_amount: data.spentAmount,
        currency: data.currency
      })
      .select()
      .single();

    if (error) throw error;
    return result;
  }

  async getProjectBudgetSummary(projectId: string): Promise<BudgetSummary> {
    const { data, error } = await supabase
      .from('project_budgets')
      .select('allocated_amount, spent_amount, currency')
      .eq('project_id', projectId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        totalAllocated: 0,
        totalSpent: 0,
        utilizationRate: 0,
        currency: 'USD'
      };
    }

    const totalAllocated = data.reduce((sum, item) => sum + Number(item.allocated_amount), 0);
    const totalSpent = data.reduce((sum, item) => sum + Number(item.spent_amount), 0);
    
    return {
      totalAllocated,
      totalSpent,
      utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
      currency: data[0]?.currency || 'USD'
    };
  }

  async getWorkspaceBudgetSummary(workspaceId: string): Promise<BudgetSummary> {
    const { data, error } = await supabase
      .from('project_budgets')
      .select(`
        allocated_amount, 
        spent_amount, 
        currency,
        projects!inner(workspace_id)
      `)
      .eq('projects.workspace_id', workspaceId);

    if (error) throw error;
    
    if (!data || data.length === 0) {
      return {
        totalAllocated: 0,
        totalSpent: 0,
        utilizationRate: 0,
        currency: 'USD'
      };
    }

    const totalAllocated = data.reduce((sum, item) => sum + Number(item.allocated_amount), 0);
    const totalSpent = data.reduce((sum, item) => sum + Number(item.spent_amount), 0);
    
    return {
      totalAllocated,
      totalSpent,
      utilizationRate: totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0,
      currency: data[0]?.currency || 'USD'
    };
  }
}

export const budgetService = new BudgetService();
