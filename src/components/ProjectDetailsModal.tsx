
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Calendar, Users, DollarSign, Target, Clock, AlertTriangle,
  CheckCircle, TrendingUp, FileText, MessageSquare, Settings
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  progress: number;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  team: Array<{ id: string; name: string; role: string; avatar?: string }>;
  milestones: Array<{ id: string; name: string; date: string; completed: boolean }>;
  risks: Array<{ id: string; description: string; impact: 'Low' | 'Medium' | 'High'; probability: 'Low' | 'Medium' | 'High' }>;
  health?: {
    overall: 'green' | 'yellow' | 'red';
    schedule: 'green' | 'yellow' | 'red';
    budget: 'green' | 'yellow' | 'red';
    scope: 'green' | 'yellow' | 'red';
    quality: 'green' | 'yellow' | 'red';
  };
}

interface ProjectDetailsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (project: Project) => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  project,
  isOpen,
  onClose,
  onEdit
}) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!project) return null;

  const getStatusVariant = (status: string): 'success' | 'warning' | 'error' | 'info' | 'default' => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'info';
      case 'On Hold': return 'warning';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getPriorityVariant = (priority: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (priority) {
      case 'Critical': 
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getHealthVariant = (health: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (health) {
      case 'green': return 'success';
      case 'yellow': return 'warning';
      case 'red': return 'error';
      default: return 'default';
    }
  };

  const getRiskVariant = (level: string): 'success' | 'warning' | 'error' | 'default' => {
    switch (level) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold">{project.name}</DialogTitle>
              <p className="text-muted-foreground mt-1">{project.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge variant={getStatusVariant(project.status)}>
                {project.status}
              </StatusBadge>
              <StatusBadge variant={getPriorityVariant(project.priority)}>
                {project.priority}
              </StatusBadge>
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
            <TabsTrigger value="health">Health</TabsTrigger>
          </TabsList>

          <div className="mt-4 overflow-y-auto">
            <TabsContent value="overview" className="space-y-6">
              {/* Project Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progress</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{project.progress}%</div>
                    <Progress value={project.progress} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Budget</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${project.spent.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      of ${project.budget.toLocaleString()} ({Math.round((project.spent / project.budget) * 100)}%)
                    </p>
                    <Progress value={(project.spent / project.budget) * 100} className="mt-2" />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Timeline</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">{project.startDate}</div>
                    <div className="text-sm text-muted-foreground">to {project.endDate}</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.team.map(member => (
                  <Card key={member.id}>
                    <CardContent className="flex items-center space-x-4 p-4">
                      <div className="w-10 h-10 bg-surface-muted rounded-full flex items-center justify-center">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="milestones" className="space-y-4">
              {project.milestones.map(milestone => (
                <Card key={milestone.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-3">
                      {milestone.completed ? (
                        <CheckCircle className="h-5 w-5 text-success" />
                      ) : (
                        <Clock className="h-5 w-5 text-muted-foreground" />
                      )}
                      <div>
                        <p className="font-medium">{milestone.name}</p>
                        <p className="text-sm text-muted-foreground">{milestone.date}</p>
                      </div>
                    </div>
                    <StatusBadge variant={milestone.completed ? 'success' : 'default'}>
                      {milestone.completed ? 'Completed' : 'Pending'}
                    </StatusBadge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="risks" className="space-y-4">
              {project.risks.map(risk => (
                <Card key={risk.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium">{risk.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm text-muted-foreground">Impact:</span>
                          <StatusBadge variant={getRiskVariant(risk.impact)}>
                            {risk.impact}
                          </StatusBadge>
                          <span className="text-sm text-muted-foreground">Probability:</span>
                          <StatusBadge variant={getRiskVariant(risk.probability)}>
                            {risk.probability}
                          </StatusBadge>
                        </div>
                      </div>
                      <AlertTriangle className="h-5 w-5 text-warning mt-1" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="health" className="space-y-4">
              {project.health && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Overall Health</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StatusBadge variant={getHealthVariant(project.health.overall)}>
                        {project.health.overall.toUpperCase()}
                      </StatusBadge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detailed Health</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Schedule</span>
                        <StatusBadge variant={getHealthVariant(project.health.schedule)}>
                          {project.health.schedule}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Budget</span>
                        <StatusBadge variant={getHealthVariant(project.health.budget)}>
                          {project.health.budget}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Scope</span>
                        <StatusBadge variant={getHealthVariant(project.health.scope)}>
                          {project.health.scope}
                        </StatusBadge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Quality</span>
                        <StatusBadge variant={getHealthVariant(project.health.quality)}>
                          {project.health.quality}
                        </StatusBadge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {onEdit && (
            <Button onClick={() => onEdit(project)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectDetailsModal;
