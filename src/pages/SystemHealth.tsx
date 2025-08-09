import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import ComingSoon from '@/components/common/ComingSoon';
import { Activity } from 'lucide-react';

const SystemHealth: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <ComingSoon 
                title="System Health"
                description="Track the health status of cross-workspace projects with clear signals and trends."
                icon={<Activity className="h-5 w-5" />}
                features={[
                  'Cross-workspace project health scores',
                  'Key risk and stability indicators',
                  'Environment status (dev/stage/prod)',
                  'Historical trends and smart alerts'
                ]}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemHealth;
