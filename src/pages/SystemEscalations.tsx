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
                description="Track projects with high numbers of escalations over time and see escalation activity across workspaces and projects."
                icon={<AlertTriangle className="h-5 w-5" />}
                features={[
                  'Projects with high escalation counts by period',
                  'Cross-workspace escalation activity',
                  'SLA breaches and response timelines',
                  'Resolution metrics and audit trail'
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
