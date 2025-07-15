
import React, { useContext, useEffect, useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import RealTimeStatus from '@/components/dashboard/RealTimeStatus';
import TinkAssistant from '@/components/TinkAssistant';
import { useRealTimeEvents } from '@/hooks/useRealTimeEvents';
import { ProjectData } from '@/types/project';

interface Project {
  name: string;
  status: string;
  progress: number;
  risk: string;
  team: number;
  deadline: string;
  aiInsight: string;
  color: string;
  priority: string;
}

const Dashboard = () => {
  const { projects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const [activeProject, setActiveProject] = useState(0);

  // Enable real-time event processing
  useRealTimeEvents();

  // Transform ProjectData to Project interface for ProjectDisplay
  const transformProjectData = (projectData: ProjectData[]): Project[] => {
    return projectData.map(project => ({
      name: project.name,
      status: project.status,
      progress: project.progress || 0,
      risk: project.health?.status === 'red' ? 'High' : project.health?.status === 'yellow' ? 'Medium' : 'Low',
      team: project.teamSize || 0,
      deadline: project.endDate ? new Date(project.endDate).toLocaleDateString() : 'No deadline',
      aiInsight: `Project ${project.name} is ${project.status.toLowerCase()} with ${project.progress || 0}% completion. Current health status shows ${project.health?.status || 'unknown'} indicators.`,
      color: project.priority === 'Critical' ? 'from-red-500/20 to-orange-500/20' : 
             project.priority === 'High' ? 'from-orange-500/20 to-yellow-500/20' :
             project.priority === 'Medium' ? 'from-blue-500/20 to-cyan-500/20' :
             'from-green-500/20 to-emerald-500/20',
      priority: project.priority
    }));
  };

  // Filter projects for current workspace
  const workspaceProjects = currentWorkspace 
    ? projects.filter(project => project.workspaceId === currentWorkspace.id)
    : [];

  const projectsForDisplay = transformProjectData(workspaceProjects);

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
      <DashboardHeader aiConfidence={85} />
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
