
import React from 'react';
import { AuthGuard } from '@/components/auth/AuthGuard';
import WorkspaceGuard from '@/components/WorkspaceGuard';
import Layout from '@/components/Layout';
import ProjectTable from '@/components/ProjectTable';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useState } from 'react';

const Projects = () => {
  const [isCreationWizardOpen, setIsCreationWizardOpen] = useState(false);

  return (
    <AuthGuard>
      <WorkspaceGuard>
        <Layout>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Projects</h1>
                <p className="text-muted-foreground mt-2">
                  Manage and track your projects across your workspace
                </p>
              </div>
              <Button 
                onClick={() => setIsCreationWizardOpen(true)}
                className="gap-2"
              >
                <Plus size={16} />
                New Project
              </Button>
            </div>
            
            <ProjectTable />
            
            {isCreationWizardOpen && (
              <ProjectCreationWizard
                onClose={() => setIsCreationWizardOpen(false)}
              />
            )}
          </div>
        </Layout>
      </WorkspaceGuard>
    </AuthGuard>
  );
};

export default Projects;
