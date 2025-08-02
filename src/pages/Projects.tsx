
import React from 'react';
import { useProjects } from '@/hooks/useProjects';
import ProjectTable from '@/components/ProjectTable';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import { Button } from '@/components/ui/button';
import { Plus, Grid, List } from 'lucide-react';
import ViewToggle from '@/components/ViewToggle';
import { useState } from 'react';

const Projects = () => {
  const { projects, loading, createProject } = useProjects();
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground">
            Manage and track all your projects in one place
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <ViewToggle 
            viewMode={viewMode} 
            onViewModeChange={setViewMode} 
          />
          <Button 
            onClick={() => setShowCreationWizard(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-card rounded-lg border border-border">
        <ProjectTable 
          projects={projects} 
          viewMode={viewMode}
        />
      </div>

      {/* Project Creation Wizard Modal */}
      {showCreationWizard && (
        <ProjectCreationWizard 
          isOpen={showCreationWizard}
          onClose={() => setShowCreationWizard(false)}
          onProjectCreate={createProject}
        />
      )}
    </div>
  );
};

export default Projects;
