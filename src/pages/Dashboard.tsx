
import React, { useContext, useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import RealTimeStatus from '@/components/dashboard/RealTimeStatus';
import TinkAssistant from '@/components/TinkAssistant';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';

const Dashboard = () => {
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [activeProject, setActiveProject] = useState(0);

  // Enable real-time event processing
  useRealTimeEvents();

  // Filter projects for current workspace
  const projectsForDisplay = currentWorkspace 
    ? projects.filter(project => project.workspaceId === currentWorkspace.id)
    : [];

  // Reset activeProject when projects change or become empty
  useEffect(() => {
    if (projectsForDisplay.length === 0) {
      setActiveProject(0);
    } else if (activeProject >= projectsForDisplay.length) {
      setActiveProject(0);
    }
  }, [projectsForDisplay.length, activeProject]);

  // Ensure activeProject is within bounds
  useEffect(() => {
    if (activeProject < 0 || activeProject >= projectsForDisplay.length) {
      setActiveProject(0);
    }
  }, [activeProject, projectsForDisplay.length]);

  console.log('Dashboard render:', {
    projectsCount: projectsForDisplay.length,
    activeProject,
    currentWorkspace: currentWorkspace?.name
  });

  return (
    <div className="space-y-6">
      <DashboardHeader />
      <DashboardMetrics />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ProjectDisplay 
            projects={projectsForDisplay} 
            activeProject={activeProject} 
            onProjectChange={setActiveProject}
          />
        </div>
        <div>
          <RealTimeStatus />
        </div>
      </div>
      <TinkAssistant />
    </div>
  );
};

export default Dashboard;
