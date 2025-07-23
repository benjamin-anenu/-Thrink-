
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Users, Shield, Settings, History } from 'lucide-react';
import EscalationMatrix from '@/components/EscalationMatrix';
import IntelligentEscalationMatrix from '@/components/IntelligentEscalationMatrix';
import { useProjects } from '@/hooks/useProjects';
import { useEscalationMatrix } from '@/hooks/useEscalationMatrix';
import { useStakeholders } from '@/hooks/useStakeholders';
import { useWorkspace } from '@/contexts/WorkspaceContext';

const StakeholderEscalationMatrix: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { projects } = useProjects();
  const { currentWorkspace } = useWorkspace();
  const { escalationMatrix, loading } = useEscalationMatrix(selectedProjectId);
  const { stakeholders } = useStakeholders(currentWorkspace?.id);

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  // Get stakeholders involved in escalation
  const escalationStakeholders = stakeholders.filter(stakeholder => 
    escalationMatrix.some(entry => 
      entry.contact_email === stakeholder.email || 
      entry.contact_name === stakeholder.name
    )
  );

  // Get escalation matrix stats
  const escalationStats = {
    totalLevels: escalationMatrix.length,
    stakeholdersInvolved: escalationStakeholders.length,
    coverageByType: escalationMatrix.reduce((acc, entry) => {
      entry.issue_types?.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-6">
      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Escalation Management System
          </CardTitle>
          <CardDescription>
            Configure intelligent escalation matrix with automated monitoring and stakeholder assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1">
              <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a project for legacy escalation matrix" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      <div className="flex items-center gap-2">
                        <span>{project.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {project.status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProject && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{escalationStats.stakeholdersInvolved} stakeholders involved</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Overview */}
      {selectedProjectId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Escalation Levels</span>
              </div>
              <div className="text-2xl font-bold">{escalationStats.totalLevels}</div>
              <p className="text-xs text-muted-foreground">
                Defined escalation levels
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Stakeholders</span>
              </div>
              <div className="text-2xl font-bold">{escalationStats.stakeholdersInvolved}</div>
              <p className="text-xs text-muted-foreground">
                Involved in escalation
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Issue Types</span>
              </div>
              <div className="text-2xl font-bold">{Object.keys(escalationStats.coverageByType).length}</div>
              <p className="text-xs text-muted-foreground">
                Types covered
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tabbed Interface */}
      <Tabs defaultValue="intelligent" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="intelligent" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Intelligent Matrix
          </TabsTrigger>
          <TabsTrigger value="legacy" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Legacy Matrix
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="intelligent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Intelligent Escalation Matrix</CardTitle>
              <CardDescription>
                Automated escalation system with stakeholder assignments and trigger monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <IntelligentEscalationMatrix projectId={selectedProjectId} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="legacy" className="space-y-4">
          {/* Stakeholder Escalation Contacts */}
          {selectedProjectId && escalationStakeholders.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Legacy Escalation Contacts</CardTitle>
                <CardDescription>
                  Stakeholders involved in the legacy escalation process for {selectedProject?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {escalationStakeholders.map((stakeholder) => {
                    const escalationEntry = escalationMatrix.find(entry => 
                      entry.contact_email === stakeholder.email || 
                      entry.contact_name === stakeholder.name
                    );
                    
                    return (
                      <div key={stakeholder.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <div className="font-medium">{stakeholder.name}</div>
                            <div className="text-sm text-muted-foreground">{stakeholder.email}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            Level {escalationEntry?.level}
                          </Badge>
                          <Badge variant="outline">
                            {escalationEntry?.contact_role}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Legacy Escalation Matrix */}
          {selectedProjectId && (
            <Card>
              <CardHeader>
                <CardTitle>Legacy Escalation Matrix Configuration</CardTitle>
                <CardDescription>
                  Configure escalation levels and procedures for {selectedProject?.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EscalationMatrix projectId={selectedProjectId} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StakeholderEscalationMatrix;
