
import React from 'react';
import ProjectReportsKPIs from './reports/ProjectReportsKPIs';
import ProjectReportsPerformance from './reports/ProjectReportsPerformance';
import ProjectReportsCharts from './reports/ProjectReportsCharts';
import ProjectReportsExport from './reports/ProjectReportsExport';
import ProjectReportsInsights from './reports/ProjectReportsInsights';
import { useReportsData } from '@/hooks/useReportsData';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const { reportsData, chartData, loading } = useReportsData(projectId);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading reports data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectReportsKPIs reportData={reportsData} />
      <ProjectReportsPerformance reportData={reportsData} />
      <ProjectReportsCharts chartData={chartData} />
      <ProjectReportsExport />
      <ProjectReportsInsights projectId={projectId} />
    </div>
  );
};

export default ProjectReports;
