import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import ComingSoon from '@/components/common/ComingSoon';
import { AlertTriangle } from 'lucide-react';

const SystemEscalations: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <ComingSoon 
                title="Escalations"
                description="Unified escalation monitoring to ensure issues are identified and acted on quickly across the enterprise."
                icon={<AlertTriangle className="h-5 w-5" />}
                features={[
                  'Global escalation rules and policies',
                  'Real-time triggers and notifications',
                  'Assignment matrix and SLAs',
                  'Audit trail and resolution metrics'
                ]}
              />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemEscalations;
