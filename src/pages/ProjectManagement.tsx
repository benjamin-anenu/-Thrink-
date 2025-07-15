
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import TinkAssistant from '@/components/TinkAssistant';
import { useProject } from '@/contexts/ProjectContext';

const ProjectManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const { projects } = useProject();

  // Get the first project as default if none selected
  const defaultProject = projects.length > 0 ? projects[0] : null;
  const currentProjectId = selectedProjectId || (defaultProject?.id || '');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Project Management</h1>
          <p className="text-muted-foreground">
            Manage your projects, timelines, and resources
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <ProjectOverview project={defaultProject} />
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <ProjectTimeline projectId={currentProjectId} />
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <ProjectResources projectId={currentProjectId} />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ProjectReports projectId={currentProjectId} />
        </TabsContent>
      </Tabs>
      
      <TinkAssistant />
    </div>
  );
};

export default ProjectManagement;
