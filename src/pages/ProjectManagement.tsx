
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectReports from '@/components/project-management/ProjectReports';
import TinkAssistant from '@/components/TinkAssistant';

const ProjectManagement = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

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
          <ProjectOverview />
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <ProjectTimeline />
        </TabsContent>
        
        <TabsContent value="resources" className="space-y-4">
          <ProjectResources />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-4">
          <ProjectReports 
            selectedProjectId={selectedProjectId}
            onProjectSelect={setSelectedProjectId}
          />
        </TabsContent>
      </Tabs>
      
      <TinkAssistant />
    </div>
  );
};

export default ProjectManagement;
