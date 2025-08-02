
import React from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import Layout from '@/components/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectResources from '@/components/project-management/ProjectResources';
import KanbanBoard from '@/components/project-management/KanbanBoard';
import ProjectReports from '@/components/project-management/ProjectReports';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';

const ProjectManagement: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { projects } = useProject();
  
  const project = projects.find(p => p.id === projectId);

  if (!projectId) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">No project ID provided.</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
            <p className="text-muted-foreground">The requested project could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="kanban">Tasks</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="documentation">Docs</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimeline projectId={projectId} />
          </TabsContent>

          <TabsContent value="kanban">
            <KanbanBoard projectId={projectId} />
          </TabsContent>

          <TabsContent value="resources">
            <ProjectResources projectId={projectId} />
          </TabsContent>

          <TabsContent value="reports">
            <ProjectReports />
          </TabsContent>

          <TabsContent value="documentation">
            <ProjectDocumentation />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProjectManagement;
