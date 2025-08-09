import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Layout from '@/components/Layout';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import { AppInitializationLoader } from '@/components/AppInitializationLoader';
import { useAppInitialization } from '@/hooks/useAppInitialization';
import { useEnterpriseOwnerPersistence } from '@/hooks/useEnterpriseOwnerPersistence';
import { Navigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { user, loading } = useAuth();
  const { isFullyLoaded } = useAppInitialization();
  const { isEnterpriseOwner } = useEnterpriseOwnerPersistence();

  // Redirect non-enterprise owners to regular dashboard
  if (!loading && !isEnterpriseOwner) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppInitializationLoader>
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="space-y-8">
              {isFullyLoaded && (
                <SystemOwnerDashboard />
              )}
            </div>
          </div>
        </div>
      </Layout>
    </AppInitializationLoader>
  );
};

export default AdminDashboard;