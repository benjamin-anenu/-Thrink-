import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import ComingSoon from '@/components/common/ComingSoon';
import { BarChart3 } from 'lucide-react';

const SystemPortfolio: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <ComingSoon 
                title="Portfolio Overview"
                description="Portfolio visibility across workspaces — tracking projects, operational excellence, and project compliance."
                icon={<BarChart3 className="h-5 w-5" />}
                features={[
                  'Cross-workspace project tracking',
                  'Operational excellence KPIs',
                  'Project compliance dashboards',
                  'Budget, risk, and timeline rollups'
                ]}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemPortfolio;
