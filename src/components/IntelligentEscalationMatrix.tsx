
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, Shield, Settings, BarChart3, Link2, Activity, Bell } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import EscalationOverview from '@/components/escalation/EscalationOverview';
import EscalationLevelManager from '@/components/escalation/EscalationLevelManager';
import TriggerAssignmentInterface from '@/components/escalation/TriggerAssignmentInterface';
import EscalationMonitoringDashboard from '@/components/escalation/EscalationMonitoringDashboard';
import EscalationNotificationService from '@/components/escalation/EscalationNotificationService';

interface IntelligentEscalationMatrixProps {
  projectId?: string;
  projects?: Array<{ id: string; name: string; status: string; }>;
}

const IntelligentEscalationMatrix: React.FC<IntelligentEscalationMatrixProps> = ({ projectId, projects }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { currentWorkspace } = useWorkspace();

  const handleDataChange = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please select a workspace to manage escalation matrix</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Levels
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Assignments
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Overview</CardTitle>
              <CardDescription>
                Monitor escalation coverage, assignments, and system health
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscalationOverview key={refreshTrigger} projectId={projectId} projects={projects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Level Management</CardTitle>
              <CardDescription>
                Create and manage escalation levels with proper hierarchy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscalationLevelManager 
                key={refreshTrigger} 
                onLevelChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Trigger Assignment Interface</CardTitle>
              <CardDescription>
                Assign escalation triggers to levels and stakeholders with visual mapping
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TriggerAssignmentInterface 
                key={refreshTrigger} 
                onAssignmentChange={handleDataChange}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automated Monitoring</CardTitle>
              <CardDescription>
                Configure and monitor automated escalation conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscalationMonitoringDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Management</CardTitle>
              <CardDescription>
                Configure notification channels and delivery settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EscalationNotificationService />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure global escalation system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">
                  Advanced settings coming soon
                </p>
                <p className="text-sm text-muted-foreground">
                  This will include global escalation policies, SLA configurations, and integration settings
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligentEscalationMatrix;
