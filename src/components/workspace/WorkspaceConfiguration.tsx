
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, Building2, Award, AlertTriangle } from 'lucide-react';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import DepartmentManagement from './config/DepartmentManagement';
import SkillsManagement from './config/SkillsManagement';
import EscalationTriggersManagement from './config/EscalationTriggersManagement';

const WorkspaceConfiguration: React.FC = () => {
  const { currentWorkspace } = useWorkspace();

  if (!currentWorkspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Please select a workspace to configure settings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Workspace Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="departments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="departments" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Departments
              </TabsTrigger>
              <TabsTrigger value="skills" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Skills
              </TabsTrigger>
              <TabsTrigger value="escalation" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Escalation Triggers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="departments">
              <DepartmentManagement />
            </TabsContent>

            <TabsContent value="skills">
              <SkillsManagement workspaceId={currentWorkspace.id} />
            </TabsContent>

            <TabsContent value="escalation">
              <EscalationTriggersManagement workspaceId={currentWorkspace.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkspaceConfiguration;
