
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
    if (!task.endDate) return false;
    const endDate = new Date(task.endDate);
    const today = new Date();
    return endDate < today && task.status !== 'Completed';
  }).length;

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  // Calculate team efficiency (based on completed vs overdue tasks)
  const teamEfficiency = totalTasks > 0 ? Math.round(((completedTasks) / (completedTasks + overdueTasks + 1)) * 100) : 100;
  
  // Calculate risk level based on overdue tasks and delayed milestones
  const delayedMilestones = milestones.filter(m => 
    m.date && m.baselineDate && new Date(m.date) > new Date(m.baselineDate)
  ).length;
  
  let riskLevel = 'Low';
  if (overdueTasks > totalTasks * 0.3 || delayedMilestones > totalMilestones * 0.2) {
    riskLevel = 'High';
  } else if (overdueTasks > totalTasks * 0.1 || delayedMilestones > 0) {
    riskLevel = 'Medium';
  }

  // Find next milestone
  const upcomingMilestones = milestones
    .filter(m => m.status !== 'completed' && m.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime());
  
  const nextMilestone = upcomingMilestones[0];
  const daysToMilestone = nextMilestone?.date 
    ? Math.ceil((new Date(nextMilestone.date).getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000))
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
