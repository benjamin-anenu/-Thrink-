
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, Users, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';
import TaskStatistics from '@/components/project-management/TaskStatistics';
import { PhaseView } from '@/components/project-management/phases/PhaseView';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import { ProjectIssueLog } from '@/components/project-management/issues/ProjectIssueLog';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import ProjectReports from '@/components/project-management/ProjectReports';

const ProjectManagement = () => {
  const { id: projectId } = useParams<{ id: string }>();
  const { projects } = useProject();
  const [activeTab, setActiveTab] = useState('overview');

  // Find the current project
  const currentProject = projects.find(p => p.id === projectId);

  if (!currentProject) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'On Hold': return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      case 'Planning': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentProject.name}</h1>
            <p className="text-muted-foreground mt-1">{currentProject.description}</p>
          </div>
          <Badge variant="secondary" className={getStatusColor(currentProject.status)}>
            {currentProject.status}
          </Badge>
        </div>

        {/* Task Statistics - removed projectId prop */}
        <TaskStatistics />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="phases">Phases</TabsTrigger>
            <TabsTrigger value="plan">Project Plan</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="issues">Issues</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{currentProject.name}</CardTitle>
                <CardDescription>{currentProject.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(currentProject.startDate).toLocaleDateString()} - {new Date(currentProject.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">${currentProject.budget?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{currentProject.teamSize || 0} team members</span>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-muted-foreground">{currentProject.progress}%</span>
                  </div>
                  <Progress value={currentProject.progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases">
            {projectId && <PhaseView projectId={projectId} />}
          </TabsContent>

          <TabsContent value="plan">
            {projectId && <ProjectGanttChart projectId={projectId} />}
          </TabsContent>

          <TabsContent value="timeline">
            {projectId && <ProjectTimeline projectId={projectId} />}
          </TabsContent>

          <TabsContent value="resources">
            {projectId && <ProjectResources projectId={projectId} />}
          </TabsContent>

          <TabsContent value="issues">
            {projectId && <ProjectIssueLog projectId={projectId} />}
          </TabsContent>

          <TabsContent value="documentation">
            {projectId && <ProjectDocumentation projectId={projectId} />}
          </TabsContent>

          <TabsContent value="reports">
            {projectId && <ProjectReports projectId={projectId} />}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
