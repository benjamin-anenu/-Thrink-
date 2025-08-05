
import React, { useState } from 'react';
import ProjectReportsKPIs from './reports/ProjectReportsKPIs';
import ProjectReportsPerformance from './reports/ProjectReportsPerformance';
import ProjectReportsCharts from './reports/ProjectReportsCharts';
import ProjectReportsExport from './reports/ProjectReportsExport';
import ProjectReportsInsights from './reports/ProjectReportsInsights';
import { useReportsData } from '@/hooks/useReportsData';
import { useMobileComplexity } from '@/hooks/useMobileComplexity';
import { DesktopRecommendation } from '@/components/ui/desktop-recommendation';
import { MobileReportsView } from './MobileReportsView';

interface ProjectReportsProps {
  projectId: string;
}

const ProjectReports: React.FC<ProjectReportsProps> = ({ projectId }) => {
  const { reportsData, chartData, loading } = useReportsData(projectId);
  const { shouldShowDesktopRecommendation } = useMobileComplexity({
    requiresInteractivity: true,
    recommendDesktop: true
  });
  const [showMobileView, setShowMobileView] = useState(false);

  if (loading) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        Loading reports data...
      </div>
    );
  }

  if (shouldShowDesktopRecommendation && !showMobileView) {
    return (
      <DesktopRecommendation
        title="Project Reports - Better on Desktop"
        description="Detailed charts and analytics are best viewed on desktop. View a simplified mobile dashboard below."
        showSimplified={true}
        onViewSimplified={() => setShowMobileView(true)}
      >
        <MobileReportsView projectId={projectId} />
      </DesktopRecommendation>
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
