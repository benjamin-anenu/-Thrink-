import React from 'react';
import Layout from '@/components/Layout';
import ReportScheduler from '@/components/reports/ReportScheduler';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { toast } from 'sonner';

const SystemReports: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();

  const handleScheduleReport = (config: any) => {
    toast.success(`Scheduled ${config.type} (${config.frequency})`);
  };

  const handleDownloadReport = (type: string) => {
    toast.info(`Preparing download for ${type}`);
  };

  const handleSendReport = (type: string) => {
    toast.info(`Sending ${type} to recipients`);
  };

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <ReportScheduler 
                onScheduleReport={handleScheduleReport}
                onDownloadReport={(t, r) => handleDownloadReport(t)}
                onSendReport={(t, r) => handleSendReport(t)}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemReports;
