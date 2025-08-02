
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import AIInsights from '@/components/dashboard/AIInsights';
import RealTimeStatus from '@/components/dashboard/RealTimeStatus';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';

const Dashboard = () => {
  const { user, isSystemOwner } = useAuth();
  const { currentWorkspace, loading } = useWorkspace();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // System owner gets a special dashboard
  if (isSystemOwner) {
    return <SystemOwnerDashboard />;
  }

  // Regular user dashboard
  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardMetrics />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <ProjectDisplay />
        </div>
        <div className="space-y-6">
          <AIInsights />
          <RealTimeStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
