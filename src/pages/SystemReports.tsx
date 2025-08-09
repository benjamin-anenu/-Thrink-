import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import ComingSoon from '@/components/common/ComingSoon';
import { FileText } from 'lucide-react';

const SystemReports: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <ComingSoon 
                title="Reports"
                description="Centralized reporting and scheduling to keep leadership informed across all initiatives."
                icon={<FileText className="h-5 w-5" />}
                features={[
                  'Executive summaries and scorecards',
                  'Automated scheduling and delivery',
                  'Export to PDF/CSV',
                  'Customizable templates'
                ]}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemReports;
