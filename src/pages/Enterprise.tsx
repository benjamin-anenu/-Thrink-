import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, Users, Shield, Activity } from 'lucide-react';
import { TeamManagement } from '@/components/enterprise/TeamManagement';
import { ComplianceDashboard } from '@/components/enterprise/ComplianceDashboard';
import { WorkspaceSelector } from '@/components/enterprise/WorkspaceSelector';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export default function Enterprise() {
  useRequireAuth();

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage your organization, teams, and compliance requirements
          </p>
        </div>
        <WorkspaceSelector />
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Workspace
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Workspace Overview</h2>
            <p className="text-muted-foreground">
              Workspace management features coming soon. Use the workspace selector above to switch between workspaces.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="team">
          <TeamManagement />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceDashboard />
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Activity Monitoring</h2>
            <p className="text-muted-foreground">
              Advanced activity monitoring and session tracking features coming soon.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}