
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from './WorkspaceContext';
import { useToast } from '@/hooks/use-toast';

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
  priority: 'Low' | 'Medium' | 'High';
  progress: number;
  health: {
    status: 'green' | 'yellow' | 'red';
    score: number;
  };
  startDate: string;
  endDate: string;
  teamSize: number;
  budget: string;
  tags: string[];
  workspaceId: string;
  resources: string[];
  stakeholders: string[];
  milestones: any[];
  tasks: any[];
}

interface ProjectContextType {
  projects: ProjectData[];
  loading: boolean;
  addProject: (project: Omit<ProjectData, 'id'>) => Promise<void>;
  updateProject: (id: string, updates: Partial<ProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  softDeleteProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
  getProject: (id: string) => ProjectData | undefined;
  refreshProjects: () => Promise<void>;
  checkProjectDependencies: (id: string) => Promise<any[]>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentWorkspace } = useWorkspace();
  const { toast } = useToast();

  useEffect(() => {
    if (currentWorkspace) {
      loadProjects();
    }
  }, [currentWorkspace]);

  const loadProjects = async () => {
    if (!currentWorkspace) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('workspace_id', currentWorkspace.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const transformedProjects = (data || []).map(transformSupabaseProject);
      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to load projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const transformSupabaseProject = (supabaseProject: any): ProjectData => ({
    id: supabaseProject.id,
    name: supabaseProject.name || 'Unnamed Project',
    description: supabaseProject.description || '',
    status: supabaseProject.status || 'Planning',
    priority: supabaseProject.priority || 'Medium',
    progress: supabaseProject.progress || 0,
    health: {
      status: supabaseProject.health_status || 'green',
      score: supabaseProject.health_score || 100
    },
    startDate: supabaseProject.start_date || new Date().toISOString().split('T')[0],
    endDate: supabaseProject.end_date || new Date().toISOString().split('T')[0],
    teamSize: supabaseProject.team_size || 0,
    budget: supabaseProject.budget || '$0',
    tags: supabaseProject.tags || [],
    workspaceId: supabaseProject.workspace_id || '',
    resources: supabaseProject.resources || [],
    stakeholders: supabaseProject.stakeholder_ids || [],
    milestones: [],
    tasks: []
  });

  const addProject = async (projectData: Omit<ProjectData, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          priority: projectData.priority,
          progress: projectData.progress,
          health_status: projectData.health.status,
          health_score: projectData.health.score,
          start_date: projectData.startDate,
          end_date: projectData.endDate,
          team_size: projectData.teamSize,
          budget: projectData.budget,
          tags: projectData.tags,
          workspace_id: projectData.workspaceId,
          resources: projectData.resources,
          stakeholder_ids: projectData.stakeholders
        })
        .select()
        .single();

      if (error) throw error;

      const newProject = transformSupabaseProject(data);
      setProjects(prev => [newProject, ...prev]);

      // Log the creation
      await supabase.from('audit_logs').insert({
        action: 'project_created',
        resource_type: 'project',
        resource_id: data.id,
        metadata: { project_name: projectData.name }
      });

      toast({
        title: 'Success',
        description: 'Project created successfully'
      });
    } catch (error) {
      console.error('Error adding project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create project',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const updateProject = async (id: string, updates: Partial<ProjectData>) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          progress: updates.progress,
          health_status: updates.health?.status,
          health_score: updates.health?.score,
          start_date: updates.startDate,
          end_date: updates.endDate,
          team_size: updates.teamSize,
          budget: updates.budget,
          tags: updates.tags,
          resources: updates.resources,
          stakeholder_ids: updates.stakeholders
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      ));

      // Log the update
      await supabase.from('audit_logs').insert({
        action: 'project_updated',
        resource_type: 'project',
        resource_id: id,
        metadata: { updated_fields: Object.keys(updates) }
      });

      toast({
        title: 'Success',
        description: 'Project updated successfully'
      });
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));

      // Log the deletion
      await supabase.from('audit_logs').insert({
        action: 'project_deleted',
        resource_type: 'project',
        resource_id: id
      });

      toast({
        title: 'Success',
        description: 'Project deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const softDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          deleted_at: new Date().toISOString(),
          deleted_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.filter(project => project.id !== id));

      // Log the soft deletion
      await supabase.from('audit_logs').insert({
        action: 'project_soft_deleted',
        resource_type: 'project',
        resource_id: id,
        metadata: { deleted_at: new Date().toISOString() }
      });

      toast({
        title: 'Success',
        description: 'Project moved to recycle bin'
      });
    } catch (error) {
      console.error('Error soft deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const restoreProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ 
          deleted_at: null,
          deleted_by: null
        })
        .eq('id', id);

      if (error) throw error;

      // Reload projects to include the restored one
      loadProjects();

      // Log the restoration
      await supabase.from('audit_logs').insert({
        action: 'project_restored',
        resource_type: 'project',
        resource_id: id,
        metadata: { restored_at: new Date().toISOString() }
      });

      toast({
        title: 'Success',
        description: 'Project restored successfully'
      });
    } catch (error) {
      console.error('Error restoring project:', error);
      toast({
        title: 'Error',
        description: 'Failed to restore project',
        variant: 'destructive'
      });
      throw error;
    }
  };

  const checkProjectDependencies = async (id: string) => {
    try {
      const { data, error } = await supabase
        .rpc('check_project_dependencies', { project_id_param: id });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking project dependencies:', error);
      return [];
    }
  };

  const getProject = (id: string) => {
    return projects.find(project => project.id === id);
  };

  const refreshProjects = async () => {
    await loadProjects();
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      loading,
      addProject,
      updateProject,
      deleteProject,
      softDeleteProject,
      restoreProject,
      getProject,
      refreshProjects,
      checkProjectDependencies
    }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};
