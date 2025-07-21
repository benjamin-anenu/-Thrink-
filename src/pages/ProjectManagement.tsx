import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import Header from '@/components/Header';
import TinkAssistant from '@/components/TinkAssistant';
import ProjectGanttChart from '@/components/project-management/ProjectGanttChart';
import ProjectOverview from '@/components/project-management/ProjectOverview';
import ProjectResources from '@/components/project-management/ProjectResources';
import ProjectTimeline from '@/components/project-management/ProjectTimeline';
import ProjectReports from '@/components/project-management/ProjectReports';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3, Calendar, Users, FileText, Target, FolderOpen, AlertTriangle } from 'lucide-react';
import ProjectDocumentation from '@/components/project-management/ProjectDocumentation';
import { ProjectIssueLog } from '@/components/project-management/issues/ProjectIssueLog';

const ProjectManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProject, setCurrentProject } = useProject();
  const [activeTab, setActiveTab] = useState('overview');

  const project = getProject(id || '');

  useEffect(() => {
    if (id) {
      setCurrentProject(id);
    }
  }, [id, setCurrentProject]);

  if (!project) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Project Not Found</h1>
            <Button onClick={() => navigate('/projects')}>
              Back to Projects
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Breadcrumb and Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/projects')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div className="h-4 w-px bg-border"></div>
          <div>
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">Project Management Dashboard</p>
          </div>
        </div>

        {/* Project Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Project Plan
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Resources
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Timeline
            </TabsTrigger>
            <TabsTrigger value="issues" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Issue Log
            </TabsTrigger>
            <TabsTrigger value="documentation" className="flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Documentation
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} />
          </TabsContent>

          <TabsContent value="gantt">
            <ProjectGanttChart projectId={project.id} />
          </TabsContent>

          <TabsContent value="resources">
            <ProjectResources projectId={project.id} />
          </TabsContent>

          <TabsContent value="timeline">
            <ProjectTimeline projectId={project.id} />
          </TabsContent>

          <TabsContent value="issues">
            <ProjectIssueLog projectId={project.id} />
          </TabsContent>

          <TabsContent value="documentation">
            <ProjectDocumentation />
          </TabsContent>

          <TabsContent value="reports">
            <ProjectReports projectId={project.id} />
          </TabsContent>
        </Tabs>
      </main>

      <TinkAssistant />
    </div>
  );
};

export default ProjectManagement;
