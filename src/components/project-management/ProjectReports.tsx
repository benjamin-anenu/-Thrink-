
import React from 'react';
import ProjectReportsKPIs from './reports/ProjectReportsKPIs';
import ProjectReportsPerformance from './reports/ProjectReportsPerformance';
import ProjectReportsCharts from './reports/ProjectReportsCharts';
import ProjectReportsExport from './reports/ProjectReportsExport';
import ProjectReportsInsights from './reports/ProjectReportsInsights';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const reportData = {
    overallProgress: 75,
    tasksCompleted: 18,
    totalTasks: 24,
    budgetUsed: 65,
    timeElapsed: 60,
    teamEfficiency: 85,
    riskLevel: 'Low',
    nextMilestone: 'Beta Testing',
    daysToMilestone: 12
  };

  return (
    <div className="space-y-6">
      <ProjectReportsKPIs reportData={reportData} />
      <ProjectReportsPerformance reportData={reportData} />
      <ProjectReportsCharts />
      <ProjectReportsExport />
      <ProjectReportsInsights />
    </div>
  );
};

export default ProjectReports;
