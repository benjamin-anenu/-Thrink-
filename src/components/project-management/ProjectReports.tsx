
import React from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import ProjectReportsKPIs from './reports/ProjectReportsKPIs';
import ProjectReportsPerformance from './reports/ProjectReportsPerformance';
import ProjectReportsCharts from './reports/ProjectReportsCharts';
import ProjectReportsExport from './reports/ProjectReportsExport';
import ProjectReportsInsights from './reports/ProjectReportsInsights';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const { tasks, milestones, loading } = useTaskManagement(projectId);

  if (loading) {
    return <div>Loading reports...</div>;
  }

  // Calculate real-time report data
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'Completed').length;
  const inProgressTasks = tasks.filter(task => task.status === 'In Progress').length;
  const overdueTasks = tasks.filter(task => {
    if (!task.end_date) return false;
    const endDate = new Date(task.end_date);
    const today = new Date();
    return endDate < today && task.status !== 'Completed';
  }).length;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate team efficiency (based on completed vs overdue tasks)
  const teamEfficiency = totalTasks > 0 ? Math.round(((completedTasks) / (completedTasks + overdueTasks + 1)) * 100) : 100;
  
  // Calculate risk level based on overdue tasks and delayed milestones
  const delayedMilestones = milestones.filter(m => 
    m.due_date && m.baseline_date && new Date(m.due_date) > new Date(m.baseline_date)
  ).length;
  
  let riskLevel = 'Low';
  if (overdueTasks > totalTasks * 0.3 || delayedMilestones > totalMilestones * 0.2) {
    riskLevel = 'High';
  } else if (overdueTasks > totalTasks * 0.1 || delayedMilestones > 0) {
    riskLevel = 'Medium';
  }

  // Find next milestone
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'Completed' && m.due_date)
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  
  const nextMilestone = upcomingMilestones[0];
  const daysToMilestone = nextMilestone?.due_date 
    ? Math.ceil((new Date(nextMilestone.due_date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  // Calculate budget used (placeholder - would come from actual budget tracking)
  const budgetUsed = Math.round((completedTasks / totalTasks) * 100) || 0;
  
  // Calculate time elapsed (placeholder - would come from project start date)
  const timeElapsed = Math.round((completedTasks / totalTasks) * 100) || 0;

  const reportData = {
    overallProgress,
    tasksCompleted: completedTasks,
    totalTasks,
    budgetUsed,
    timeElapsed,
    teamEfficiency,
    riskLevel,
    nextMilestone: nextMilestone?.name || 'No upcoming milestones',
    daysToMilestone: Math.max(0, daysToMilestone),
    overdueTasks,
    inProgressTasks,
    completedMilestones,
    totalMilestones
  };

  return (
    <div className="space-y-6">
      <ProjectReportsKPIs reportData={reportData} />
      <ProjectReportsPerformance reportData={reportData} />
      <ProjectReportsCharts tasks={tasks} milestones={milestones} />
      <ProjectReportsExport projectId={projectId} tasks={tasks} milestones={milestones} />
      <ProjectReportsInsights projectId={projectId} />
    </div>
  );
};

export default ProjectReports;
