import React from 'react';
import Layout from '@/components/Layout';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import { useRequireAuth } from '@/hooks/useRequireAuth';

const SystemPortfolio: React.FC = () => {
  const { isFullyLoaded } = useAppInitialization();
  
  // Require system owner role
  useRequireAuth({ 
    requiredRole: 'owner' 
  });

  return (
    <AppInitializationLoader>
      {isFullyLoaded && (
        <Layout>
          <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <SystemOwnerDashboard />
            </div>
          </div>
        </Layout>
      )}
    </AppInitializationLoader>
  );
};

export default SystemPortfolio;
