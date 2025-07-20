
import { useState, useEffect } from 'react';
import { useTaskManagement } from './useTaskManagement';
import { useMilestones } from './useMilestones';

export interface ProjectInsight {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  description: string;
  category: string;
  actionable: boolean;
}

export interface TeamPerformance {
  averageScore: number;
  trend: 'improving' | 'declining' | 'stable';
  highPerformers: number;
  lowPerformers: number;
}

export interface DeadlineStatus {
  onTrack: number;
  atRisk: number;
  overdue: number;
  upcomingDeadlines: number;
}

export const useProjectInsights = (projectId?: string) => {
  const { tasks, loading: tasksLoading } = useTaskManagement(projectId || '');
  const { milestones, loading: milestonesLoading } = useMilestones(projectId);
  const [insights, setInsights] = useState<ProjectInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (tasksLoading || milestonesLoading) {
      setIsLoading(true);
      return;
    }

    try {
      const generatedInsights: ProjectInsight[] = [];
      const today = new Date();

      // Check for overdue tasks
      const overdueTasks = tasks.filter(task => 
        task.status !== 'Completed' && 
        new Date(task.endDate) < today
      );

      if (overdueTasks.length > 0) {
        generatedInsights.push({
          id: 'overdue-tasks',
          type: 'warning',
          title: `${overdueTasks.length} Overdue Tasks`,
          description: `You have ${overdueTasks.length} tasks that are past their due date. Consider updating timelines or reallocating resources.`,
          category: 'Schedule',
          actionable: true
        });
      }

      // Check for critical tasks
      const criticalTasks = tasks.filter(task => 
        task.priority === 'Critical' && task.status !== 'Completed'
      );

      if (criticalTasks.length > 0) {
        generatedInsights.push({
          id: 'critical-tasks',
          type: 'error',
          title: `${criticalTasks.length} Critical Tasks Pending`,
          description: `High priority tasks require immediate attention to avoid project delays.`,
          category: 'Priority',
          actionable: true
        });
      }

      // Check for upcoming milestones
      const upcomingMilestones = milestones.filter(milestone => {
        const milestoneDate = new Date(milestone.date);
        const daysUntil = Math.ceil((milestoneDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil <= 7 && daysUntil > 0 && milestone.status !== 'completed';
      });

      if (upcomingMilestones.length > 0) {
        generatedInsights.push({
          id: 'upcoming-milestones',
          type: 'info',
          title: `${upcomingMilestones.length} Milestones Due Soon`,
          description: 'Several milestones are approaching their deadlines. Review progress and ensure deliverables are on track.',
          category: 'Milestones',
          actionable: true
        });
      }

      // Positive insights
      const completedTasks = tasks.filter(task => task.status === 'Completed');
      const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

      if (completionRate >= 80) {
        generatedInsights.push({
          id: 'high-completion',
          type: 'success',
          title: 'Excellent Progress',
          description: `${Math.round(completionRate)}% of tasks completed. Your team is performing exceptionally well!`,
          category: 'Performance',
          actionable: false
        });
      }

      setInsights(generatedInsights);
      setError(null);
    } catch (err) {
      setError('Failed to generate insights');
      console.error('Error generating insights:', err);
    } finally {
      setIsLoading(false);
    }
  }, [tasks, milestones, tasksLoading, milestonesLoading]);

  // Calculate team performance
  const teamPerformance: TeamPerformance = {
    averageScore: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'Completed').length / tasks.length) * 100) : 0,
    trend: 'stable', // Simplified
    highPerformers: Math.floor(Math.random() * 5) + 1, // Mock data
    lowPerformers: Math.floor(Math.random() * 2)
  };

  // Calculate deadline status
  const today = new Date();
  const deadlineStatus: DeadlineStatus = {
    onTrack: tasks.filter(task => 
      task.status !== 'Completed' && 
      new Date(task.endDate) >= today &&
      new Date(task.endDate).getTime() - today.getTime() > 3 * 24 * 60 * 60 * 1000
    ).length,
    atRisk: tasks.filter(task => {
      const daysUntil = (new Date(task.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return task.status !== 'Completed' && daysUntil <= 3 && daysUntil > 0;
    }).length,
    overdue: tasks.filter(task => 
      task.status !== 'Completed' && 
      new Date(task.endDate) < today
    ).length,
    upcomingDeadlines: tasks.filter(task => {
      const daysUntil = (new Date(task.endDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
      return task.status !== 'Completed' && daysUntil <= 7 && daysUntil > 0;
    }).length
  };

  const recommendations = [
    'Focus on completing critical priority tasks first',
    'Consider breaking down large tasks into smaller, manageable chunks',
    'Schedule regular check-ins with team members on overdue items',
    'Review and update project timelines based on current progress'
  ];

  return {
    insights,
    teamPerformance,
    deadlineStatus,
    recommendations: recommendations.slice(0, Math.min(insights.length + 1, 4)),
    isLoading,
    error
  };
};
