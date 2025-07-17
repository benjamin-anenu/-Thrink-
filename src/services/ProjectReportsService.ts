
import { supabase } from '@/integrations/supabase/client';
import { budgetService } from './BudgetService';

export interface ProjectKPIs {
  overallProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  budgetUsed: number;
  timeElapsed: number;
  teamEfficiency: number;
  riskLevel: string;
  nextMilestone: string;
  daysToMilestone: number;
}

export interface ProjectPerformanceData {
  weeklyProgress: Array<{
    week: string;
    planned: number;
    actual: number;
    efficiency: number;
  }>;
  resourceUtilization: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  timelineVariance: Array<{
    month: string;
    planned: number;
    actual: number;
    variance: number;
  }>;
  budgetAnalysis: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
  }>;
}

class ProjectReportsService {
  async getProjectKPIs(projectId: string): Promise<ProjectKPIs> {
    try {
      // Get project data
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;

      // Get tasks data
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId);

      if (tasksError) throw tasksError;

      // Get milestones data
      const { data: milestones, error: milestonesError } = await supabase
        .from('milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('due_date', { ascending: true });

      if (milestonesError) throw milestonesError;

      // Calculate KPIs
      const totalTasks = tasks?.length || 0;
      const completedTasks = tasks?.filter(task => task.status === 'Completed').length || 0;
      const overallProgress = project?.progress || 0;

      // Calculate time elapsed (based on project start and end dates)
      let timeElapsed = 0;
      if (project?.start_date && project?.end_date) {
        const startDate = new Date(project.start_date);
        const endDate = new Date(project.end_date);
        const currentDate = new Date();
        const totalDuration = endDate.getTime() - startDate.getTime();
        const elapsedDuration = Math.min(currentDate.getTime() - startDate.getTime(), totalDuration);
        timeElapsed = Math.max(0, Math.round((elapsedDuration / totalDuration) * 100));
      }

      // Get budget utilization
      const budgetSummary = await budgetService.getProjectBudgetSummary(projectId);
      const budgetUsed = budgetSummary.utilizationRate;

      // Calculate team efficiency (based on task completion vs time elapsed)
      const teamEfficiency = timeElapsed > 0 ? Math.round((overallProgress / timeElapsed) * 100) : 85;

      // Find next milestone
      const upcomingMilestones = milestones?.filter(m => 
        new Date(m.due_date || '') > new Date() && m.status !== 'completed'
      ) || [];
      
      const nextMilestone = upcomingMilestones[0];
      const nextMilestoneName = nextMilestone?.name || 'No upcoming milestones';
      
      let daysToMilestone = 0;
      if (nextMilestone?.due_date) {
        const today = new Date();
        const milestoneDate = new Date(nextMilestone.due_date);
        daysToMilestone = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      }

      // Determine risk level based on progress vs time
      let riskLevel = 'Low';
      if (timeElapsed > overallProgress + 20) {
        riskLevel = 'High';
      } else if (timeElapsed > overallProgress + 10) {
        riskLevel = 'Medium';
      }

      return {
        overallProgress,
        tasksCompleted: completedTasks,
        totalTasks,
        budgetUsed,
        timeElapsed,
        teamEfficiency: Math.min(teamEfficiency, 100),
        riskLevel,
        nextMilestone: nextMilestoneName,
        daysToMilestone: Math.max(daysToMilestone, 0)
      };
    } catch (error) {
      console.error('Error fetching project KPIs:', error);
      // Return fallback data
      return {
        overallProgress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        budgetUsed: 0,
        timeElapsed: 0,
        teamEfficiency: 0,
        riskLevel: 'Unknown',
        nextMilestone: 'No data',
        daysToMilestone: 0
      };
    }
  }

  async getProjectPerformanceData(projectId: string): Promise<ProjectPerformanceData> {
    try {
      // Get tasks with creation dates for progress tracking
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at');

      if (tasksError) throw tasksError;

      // Get budget data
      const { data: budgets, error: budgetError } = await supabase
        .from('project_budgets')
        .select('*')
        .eq('project_id', projectId);

      if (budgetError) throw budgetError;

      // Generate weekly progress data (last 5 weeks)
      const weeklyProgress = this.generateWeeklyProgress(tasks || []);

      // Generate resource utilization data
      const resourceUtilization = this.generateResourceUtilization(tasks || []);

      // Generate timeline variance data (last 6 months)
      const timelineVariance = this.generateTimelineVariance(tasks || []);

      // Generate budget analysis
      const budgetAnalysis = this.generateBudgetAnalysis(budgets || []);

      return {
        weeklyProgress,
        resourceUtilization,
        timelineVariance,
        budgetAnalysis
      };
    } catch (error) {
      console.error('Error fetching project performance data:', error);
      return {
        weeklyProgress: [],
        resourceUtilization: [],
        timelineVariance: [],
        budgetAnalysis: []
      };
    }
  }

  private generateWeeklyProgress(tasks: any[]): Array<{week: string, planned: number, actual: number, efficiency: number}> {
    const weeks = [];
    const now = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const weekTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= weekStart && taskDate <= weekEnd;
      });
      
      const completedTasks = weekTasks.filter(task => task.status === 'Completed').length;
      const totalTasks = weekTasks.length;
      const planned = Math.max(totalTasks, 1);
      const actual = completedTasks;
      const efficiency = totalTasks > 0 ? Math.round((actual / planned) * 100) : 0;
      
      weeks.push({
        week: `Week ${5 - i}`,
        planned,
        actual,
        efficiency
      });
    }
    
    return weeks;
  }

  private generateResourceUtilization(tasks: any[]): Array<{name: string, value: number, color: string}> {
    const resourceMap = new Map<string, number>();
    const colors = [
      'hsl(var(--primary))',
      'hsl(var(--secondary))',
      'hsl(var(--accent))',
      'hsl(var(--muted))',
      'hsl(var(--destructive))'
    ];
    
    tasks.forEach(task => {
      if (task.assigned_resources && Array.isArray(task.assigned_resources)) {
        task.assigned_resources.forEach((resourceId: string) => {
          const count = resourceMap.get(resourceId) || 0;
          resourceMap.set(resourceId, count + 1);
        });
      }
    });
    
    const resources = Array.from(resourceMap.entries()).map(([resourceId, count], index) => ({
      name: `Resource ${index + 1}`,
      value: Math.min(Math.round((count / tasks.length) * 100), 100),
      color: colors[index % colors.length]
    }));
    
    return resources.length > 0 ? resources : [
      { name: 'No Resources', value: 0, color: colors[0] }
    ];
  }

  private generateTimelineVariance(tasks: any[]): Array<{month: string, planned: number, actual: number, variance: number}> {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const now = new Date();
    
    return months.map((month, index) => {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - index) + 1, 0);
      
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });
      
      const plannedHours = monthTasks.length * 8; // Assume 8 hours per task
      const actualHours = monthTasks.filter(t => t.status === 'Completed').length * 8;
      const variance = actualHours - plannedHours;
      
      return {
        month,
        planned: plannedHours,
        actual: actualHours,
        variance
      };
    });
  }

  private generateBudgetAnalysis(budgets: any[]): Array<{category: string, budgeted: number, spent: number, remaining: number}> {
    if (!budgets || budgets.length === 0) {
      return [
        { category: 'No Budget Data', budgeted: 0, spent: 0, remaining: 0 }
      ];
    }
    
    return budgets.map(budget => ({
      category: budget.budget_category || 'Uncategorized',
      budgeted: Number(budget.allocated_amount) || 0,
      spent: Number(budget.spent_amount) || 0,
      remaining: (Number(budget.allocated_amount) || 0) - (Number(budget.spent_amount) || 0)
    }));
  }
}

export const projectReportsService = new ProjectReportsService();
