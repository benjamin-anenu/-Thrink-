
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTaskManagement } from './useTaskManagement';
import { useMilestones } from './useMilestones';

export interface ReportsData {
  overallProgress: number;
  tasksCompleted: number;
  totalTasks: number;
  budgetUsed: number;
  timeElapsed: number;
  teamEfficiency: number;
  riskLevel: string;
  nextMilestone: string;
  daysToMilestone: number;
  overdueItems: number;
  completionRate: number;
  milestonesCompleted: number;
  totalMilestones: number;
  criticalTasks: number;
  averageTaskDuration: number;
}

export interface ChartData {
  progressOverTime: Array<{
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

export const useReportsData = (projectId?: string) => {
  const { tasks, milestones: taskMilestones, loading: tasksLoading } = useTaskManagement(projectId || '');
  const { milestones, loading: milestonesLoading } = useMilestones(projectId);
  const [budgetData, setBudgetData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load budget data
  useEffect(() => {
    const loadBudgetData = async () => {
      if (!projectId) return;
      
      try {
        const { data, error } = await supabase
          .from('project_budgets')
          .select('*')
          .eq('project_id', projectId);

        if (error) throw error;
        setBudgetData(data || []);
      } catch (error) {
        console.error('Error loading budget data:', error);
      }
    };

    loadBudgetData();
  }, [projectId]);

  // Calculate reports data
  const reportsData: ReportsData = useMemo(() => {
    if (!tasks.length) {
      return {
        overallProgress: 0,
        tasksCompleted: 0,
        totalTasks: 0,
        budgetUsed: 0,
        timeElapsed: 0,
        teamEfficiency: 0,
        riskLevel: 'Low',
        nextMilestone: 'No milestones',
        daysToMilestone: 0,
        overdueItems: 0,
        completionRate: 0,
        milestonesCompleted: 0,
        totalMilestones: 0,
        criticalTasks: 0,
        averageTaskDuration: 0
      };
    }

    const completedTasks = tasks.filter(task => task.status === 'Completed').length;
    const totalTasks = tasks.length;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Calculate overdue items
    const today = new Date();
    const overdueItems = tasks.filter(task => 
      task.status !== 'Completed' && 
      new Date(task.endDate) < today
    ).length;

    // Calculate milestones
    const completedMilestones = milestones.filter(m => m.status === 'completed').length;
    const totalMilestones = milestones.length;

    // Find next milestone
    const upcomingMilestones = milestones
      .filter(m => m.status === 'upcoming' || m.status === 'in-progress')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const nextMilestone = upcomingMilestones[0];
    const daysToMilestone = nextMilestone 
      ? Math.ceil((new Date(nextMilestone.date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Calculate critical tasks (high/critical priority that are not completed)
    const criticalTasks = tasks.filter(task => 
      (task.priority === 'High' || task.priority === 'Critical') && 
      task.status !== 'Completed'
    ).length;

    // Calculate average task duration
    const avgDuration = tasks.length > 0 
      ? Math.round(tasks.reduce((sum, task) => sum + task.duration, 0) / tasks.length)
      : 0;

    // Calculate budget utilization
    const totalBudget = budgetData.reduce((sum, item) => sum + Number(item.allocated_amount), 0);
    const totalSpent = budgetData.reduce((sum, item) => sum + Number(item.spent_amount), 0);
    const budgetUsed = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // Calculate team efficiency (based on completed vs planned tasks)
    const teamEfficiency = Math.min(100, Math.round(overallProgress * 1.2)); // Simplified calculation

    // Determine risk level
    let riskLevel = 'Low';
    if (overdueItems > 5 || criticalTasks > 3 || budgetUsed > 90) {
      riskLevel = 'High';
    } else if (overdueItems > 2 || criticalTasks > 1 || budgetUsed > 75) {
      riskLevel = 'Medium';
    }

    return {
      overallProgress,
      tasksCompleted: completedTasks,
      totalTasks,
      budgetUsed,
      timeElapsed: overallProgress, // Simplified - could be calculated based on project dates
      teamEfficiency,
      riskLevel,
      nextMilestone: nextMilestone?.name || 'No upcoming milestones',
      daysToMilestone,
      overdueItems,
      completionRate: overallProgress,
      milestonesCompleted: completedMilestones,
      totalMilestones,
      criticalTasks,
      averageTaskDuration: avgDuration
    };
  }, [tasks, milestones, budgetData]);

  // Generate chart data
  const chartData: ChartData = useMemo(() => {
    // Progress over time (last 5 weeks)
    const progressOverTime = [];
    for (let i = 4; i >= 0; i--) {
      const weekDate = new Date();
      weekDate.setDate(weekDate.getDate() - (i * 7));
      const weekStr = `Week ${5 - i}`;
      
      // Calculate tasks that should have been completed by this date
      const tasksPlannedByWeek = tasks.filter(task => 
        new Date(task.baselineEndDate) <= weekDate
      ).length;
      
      // Calculate tasks actually completed by this date
      const tasksActualByWeek = tasks.filter(task => 
        task.status === 'Completed' && new Date(task.endDate) <= weekDate
      ).length;

      const planned = Math.round((tasksPlannedByWeek / Math.max(tasks.length, 1)) * 100);
      const actual = Math.round((tasksActualByWeek / Math.max(tasks.length, 1)) * 100);
      const efficiency = planned > 0 ? Math.round((actual / planned) * 100) : 100;

      progressOverTime.push({
        week: weekStr,
        planned,
        actual,
        efficiency: Math.min(100, efficiency)
      });
    }

    // Resource utilization (simplified)
    const resourceUtilization = [
      { name: 'Development', value: 85, color: 'hsl(var(--primary))' },
      { name: 'Design', value: 72, color: 'hsl(var(--secondary))' },
      { name: 'Testing', value: 90, color: 'hsl(var(--accent))' },
      { name: 'Management', value: 65, color: 'hsl(var(--muted))' }
    ];

    // Timeline variance (last 6 months)
    const timelineVariance = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStr = monthDate.toLocaleDateString('en', { month: 'short' });
      
      // Simplified calculation
      const planned = 100 + (i * 20);
      const actual = planned + (Math.random() * 30 - 15); // Add some variance
      
      timelineVariance.push({
        month: monthStr,
        planned,
        actual: Math.round(actual),
        variance: Math.round(actual - planned)
      });
    }

    // Budget analysis
    const budgetAnalysis = budgetData.map(item => ({
      category: item.budget_category,
      budgeted: Number(item.allocated_amount),
      spent: Number(item.spent_amount),
      remaining: Number(item.allocated_amount) - Number(item.spent_amount)
    }));

    return {
      progressOverTime,
      resourceUtilization,
      timelineVariance,
      budgetAnalysis
    };
  }, [tasks, budgetData]);

  useEffect(() => {
    setLoading(tasksLoading || milestonesLoading);
  }, [tasksLoading, milestonesLoading]);

  return {
    reportsData,
    chartData,
    loading,
    refreshData: () => {
      // Trigger refresh if needed
    }
  };
};
