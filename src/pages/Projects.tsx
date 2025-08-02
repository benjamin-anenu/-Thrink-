
import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import Layout from '@/components/Layout';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

const Projects: React.FC = () => {
  const { projects, refreshProjects } = useProject();
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handleProjectCreated = async () => {
    await refreshProjects();
    setIsWizardOpen(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>

        <div className="space-y-6">
          <ProjectDisplay />
        </div>

        {isWizardOpen && (
          <ProjectCreationWizard
            isOpen={true}
            onClose={() => setIsWizardOpen(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;
