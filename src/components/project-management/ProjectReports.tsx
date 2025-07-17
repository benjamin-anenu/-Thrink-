
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import ProjectReportsKPIs from './reports/ProjectReportsKPIs';
import ProjectReportsPerformance from './reports/ProjectReportsPerformance';
import ProjectReportsCharts from './reports/ProjectReportsCharts';
import ProjectReportsExport from './reports/ProjectReportsExport';
import ProjectReportsInsights from './reports/ProjectReportsInsights';
import { projectReportsService } from '@/services/ProjectReportsService';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const { 
    data: kpis, 
    isLoading: kpisLoading, 
    error: kpisError 
  } = useQuery({
    queryKey: ['project-kpis', projectId],
    queryFn: () => projectReportsService.getProjectKPIs(projectId),
    refetchInterval: 30000 // Refetch every 30 seconds for real-time updates
  });

  const { 
    data: performanceData, 
    isLoading: performanceLoading, 
    error: performanceError 
  } = useQuery({
    queryKey: ['project-performance', projectId],
    queryFn: () => projectReportsService.getProjectPerformanceData(projectId),
    refetchInterval: 60000 // Refetch every minute
  });

  if (kpisError || performanceError) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load project reports. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (kpisLoading || performanceLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {kpis && <ProjectReportsKPIs reportData={kpis} />}
      {kpis && <ProjectReportsPerformance reportData={kpis} />}
      {performanceData && <ProjectReportsCharts performanceData={performanceData} />}
      <ProjectReportsExport projectId={projectId} />
      <ProjectReportsInsights projectId={projectId} />
    </div>
  );
};

export default ProjectReports;
