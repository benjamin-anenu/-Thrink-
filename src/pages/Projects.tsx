
import React, { useState, useMemo } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import Layout from '@/components/Layout';
import ProjectDisplay from '@/components/dashboard/ProjectDisplay';
import ProjectListView from '@/components/ProjectListView';
import ProjectFilters, { ProjectFiltersState } from '@/components/ProjectFilters';
import ProjectCreationWizard from '@/components/ProjectCreationWizard';
import ViewToggle from '@/components/ViewToggle';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import ProjectDetailsModal from '@/components/ProjectDetailsModal';
import { transformProjectForModal, ProjectDetailsModalData } from '@/types/project-modal';

const Projects: React.FC = () => {
  const { projects, refreshProjects } = useProject();
  const { currentWorkspace } = useWorkspace();
  const navigate = useNavigate();
  
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectDetailsModalData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<ProjectFiltersState>({
    search: '',
    status: [],
    priority: [],
    healthStatus: [],
    teamSizeMin: null,
    teamSizeMax: null,
    startDateFrom: '',
    startDateTo: '',
    endDateFrom: '',
    endDateTo: ''
  });

  // Filter projects by current workspace and applied filters
  const filteredProjects = useMemo(() => {
    let workspaceProjects = projects.filter(project => 
      !currentWorkspace || project.workspaceId === currentWorkspace.id
    );

    // Apply filters
    return workspaceProjects.filter(project => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = project.name.toLowerCase().includes(searchTerm) ||
                            project.description.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(project.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(project.priority)) {
        return false;
      }

      // Health status filter
      if (filters.healthStatus.length > 0) {
        const healthStatus = project.health?.status || 'green';
        if (!filters.healthStatus.includes(healthStatus)) {
          return false;
        }
      }

      // Team size filter
      const teamSize = project.teamSize || 0;
      if (filters.teamSizeMin !== null && teamSize < filters.teamSizeMin) {
        return false;
      }
      if (filters.teamSizeMax !== null && teamSize > filters.teamSizeMax) {
        return false;
      }

      // Start date filter
      if (filters.startDateFrom && project.startDate) {
        if (new Date(project.startDate) < new Date(filters.startDateFrom)) {
          return false;
        }
      }
      if (filters.startDateTo && project.startDate) {
        if (new Date(project.startDate) > new Date(filters.startDateTo)) {
          return false;
        }
      }

      // End date filter
      if (filters.endDateFrom && project.endDate) {
        if (new Date(project.endDate) < new Date(filters.endDateFrom)) {
          return false;
        }
      }
      if (filters.endDateTo && project.endDate) {
        if (new Date(project.endDate) > new Date(filters.endDateTo)) {
          return false;
        }
      }

      return true;
    });
  }, [projects, currentWorkspace, filters]);

  const handleProjectCreated = async () => {
    await refreshProjects();
    setIsWizardOpen(false);
  };

  const handleViewDetails = async (project: any) => {
    try {
      const modalProject = transformProjectForModal(
        {
          id: project.id,
          name: project.name,
          description: project.description,
          status: project.status,
          priority: project.priority,
          progress: project.progress,
          start_date: project.startDate,
          end_date: project.endDate,
          budget: project.budget,
          health_status: project.healthStatus || project.health?.status,
          health_score: project.healthScore || project.health?.score,
          team_size: project.teamSize,
          workspace_id: project.workspaceId
        },
        [], // tasks will be loaded in modal
        [], // team members will be loaded in modal
        [], // milestones will be loaded in modal
        []  // risks will be loaded in modal
      );

      setSelectedProject(modalProject);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error preparing project details:', error);
      // Still try to open modal with basic data
      setSelectedProject({
        id: project.id || '',
        name: project.name || 'Unnamed Project',
        description: project.description || '',
        status: 'Planning',
        priority: 'Medium',
        progress: project.progress || 0,
        startDate: project.startDate || new Date().toISOString().split('T')[0],
        endDate: project.endDate || new Date().toISOString().split('T')[0],
        budget: 0,
        spent: 0,
        team: [],
        milestones: [],
        risks: [],
        health: {
          overall: 'green',
          schedule: 'green',
          budget: 'green',
          scope: 'green',
          quality: 'green'
        }
      });
      setIsModalOpen(true);
    }
  };

  const handleManageProject = (project: any) => {
    navigate(`/project/${project.id}`);
  };

  const handleDeleteProject = async (project: any) => {
    setDeletingProject(project.id);
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', project.id);

      if (error) throw error;

      toast.success(`${project.name} has been moved to recycle bin`);
      refreshProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    } finally {
      setDeletingProject(null);
    }
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      status: [],
      priority: [],
      healthStatus: [],
      teamSizeMin: null,
      teamSizeMax: null,
      startDateFrom: '',
      startDateTo: '',
      endDateFrom: '',
      endDateTo: ''
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
            <ViewToggle view={currentView} onViewChange={setCurrentView} />
            <Button onClick={() => setIsWizardOpen(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="mb-6">
            <ProjectFilters
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={handleClearFilters}
            />
          </div>
        )}

        <div className="space-y-6">
          {currentView === 'grid' ? (
            <ProjectDisplay
              projects={filteredProjects}
              onViewDetails={handleViewDetails}
              onManageProject={handleManageProject}
              onDeleteProject={handleDeleteProject}
              deletingProject={deletingProject}
            />
          ) : (
            <ProjectListView
              projects={filteredProjects}
              onViewDetails={handleViewDetails}
              onManageProject={handleManageProject}
              onDeleteProject={handleDeleteProject}
              deletingProject={deletingProject}
            />
          )}
        </div>

        {isWizardOpen && (
          <ProjectCreationWizard
            isOpen={true}
            onClose={() => setIsWizardOpen(false)}
            onProjectCreated={handleProjectCreated}
          />
        )}

        {selectedProject && (
          <ProjectDetailsModal
            project={selectedProject}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedProject(null);
            }}
          />
        )}
      </div>
    </Layout>
  );
};

export default Projects;
