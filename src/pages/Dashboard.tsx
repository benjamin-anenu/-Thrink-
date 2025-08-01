
import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import WorkspaceGuard from '@/components/WorkspaceGuard';
import Layout from '@/components/Layout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import RealTimeStatus from '@/components/dashboard/RealTimeStatus';
import AIInsights from '@/components/dashboard/AIInsights';

const Dashboard = () => {
  return (
    <AuthGuard>
      <WorkspaceGuard>
        <Layout>
          <div className="space-y-6">
            <DashboardHeader aiConfidence={95} />
            <DashboardMetrics />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProjectDisplay />
              <RealTimeStatus />
            </div>
            <AIInsights />
          </div>
        </Layout>
      </WorkspaceGuard>
    </AuthGuard>
  );
};

export default Dashboard;
