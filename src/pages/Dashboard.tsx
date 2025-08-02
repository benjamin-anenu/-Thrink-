
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Layout from '@/components/Layout';
import SimpleDashboard from '@/components/dashboard/SimpleDashboard';
import SystemOwnerDashboard from '@/components/dashboard/SystemOwnerDashboard';
import FirstUserOnboarding from '@/components/FirstUserOnboarding';
import PageHeader from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, role, loading } = useAuth();
  const { workspaces, currentWorkspace } = useWorkspace();

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-muted-foreground">Loading dashboard...</div>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if user is system owner (first user with no workspaces or admin role)
  const isSystemOwner = role === 'admin' || role === 'owner' || (workspaces.length === 0 && user);

  // Show first user onboarding for system owners with no workspaces
  if (isSystemOwner && workspaces.length === 0) {
    return <FirstUserOnboarding />;
  }

  // Show system owner dashboard for admins/owners
  if (isSystemOwner) {
    return (
      <Layout>
        <div className="container mx-auto px-4 max-w-7xl">
          <PageHeader 
            title="System Owner Dashboard" 
            description="Manage your organization and monitor all workspaces"
          />
          <SystemOwnerDashboard />
        </div>
      </Layout>
    );
  }

  // Show workspace selection if no current workspace
  if (!currentWorkspace && workspaces.length > 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 max-w-7xl">
          <PageHeader 
            title="Dashboard" 
            description="Select a workspace to view your dashboard"
          />
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Please select a workspace from the header to view your dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  // Regular dashboard for users with workspaces
  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-7xl">
        <PageHeader 
          title="Dashboard" 
          description="Overview of your projects, tasks, and team performance"
        />
        
        <div className="space-y-8">
          {currentWorkspace ? (
            <SimpleDashboard />
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No workspace selected. Please create or select a workspace to get started.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Workspace
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
