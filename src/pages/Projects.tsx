
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCreationWizard } from '@/components/ProjectCreationWizard';
import { ProjectTable } from '@/components/ProjectTable';
import PageHeader from '@/components/PageHeader';

const Projects = () => {
  const navigate = useNavigate();
  const { projects, loading } = useProjects();
  const [showCreationWizard, setShowCreationWizard] = useState(false);

  const handleOpenProject = (projectId: string) => {
    // Navigate to the project management page with the correct route
    navigate(`/project-management/${projectId}`);
  };

  const handleCreateProject = () => {
    setShowCreationWizard(true);
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <PageHeader 
        title="Projects"
        description="Manage and track all your projects in one place"
      >
        <Button onClick={handleCreateProject} className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </PageHeader>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading projects...</div>
        </div>
      ) : (
        <ProjectTable 
          projects={projects} 
          onOpenProject={handleOpenProject}
        />
      )}

      {showCreationWizard && (
        <ProjectCreationWizard 
          isOpen={showCreationWizard}
          onClose={() => setShowCreationWizard(false)}
        />
      )}
    </div>
  );
};

export default Projects;
