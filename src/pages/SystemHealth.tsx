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
                description="A single pane of glass for uptime, error rates, and performance across your environments."
                icon={<Activity className="h-5 w-5" />}
                features={[
                  'Uptime and response time dashboards',
                  'Real-time incident alerts',
                  'Service dependency status',
                  'Release impact insights'
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
