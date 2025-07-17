
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  workspace_id: string;
  stakeholder_ids: string[];
  deleted_at: string | null;
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  currentProject: string | null;
  setCurrentProject: (projectId: string) => void;
  addProject: (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => Promise<void>;
  updateProject: (id: string, projectData: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  softDeleteProject: (id: string) => Promise<void>;
  restoreProject: (id: string) => Promise<void>;
  getProject: (id: string) => Project | undefined;
  loadProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our interface
      const transformedProjects: Project[] = (data || []).map(project => ({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
        start_date: project.start_date,
        end_date: project.end_date,
        created_at: project.created_at,
        updated_at: project.updated_at,
        workspace_id: project.workspace_id,
        stakeholder_ids: project.stakeholder_ids || [],
        deleted_at: project.deleted_at
      }));

      setProjects(transformedProjects);
    } catch (error) {
      console.error('Error loading projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([projectData])
        .select()
        .single();

      if (error) throw error;

      const transformedProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
        start_date: data.start_date,
        end_date: data.end_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        workspace_id: data.workspace_id,
        stakeholder_ids: data.stakeholder_ids || [],
        deleted_at: data.deleted_at
      };

      setProjects(prev => [...prev, transformedProject]);
      toast.success('Project added successfully');
    } catch (error) {
      console.error('Error adding project:', error);
      toast.error('Failed to add project');
    }
  };

  const updateProject = async (id: string, projectData: Partial<Project>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update(projectData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const transformedProject: Project = {
        id: data.id,
        name: data.name,
        description: data.description,
        status: data.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
        start_date: data.start_date,
        end_date: data.end_date,
        created_at: data.created_at,
        updated_at: data.updated_at,
        workspace_id: data.workspace_id,
        stakeholder_ids: data.stakeholder_ids || [],
        deleted_at: data.deleted_at
      };

      setProjects(prev =>
        prev.map(project => (project.id === id ? { ...project, ...transformedProject } : project))
      );
      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  };

  const softDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(project =>
        project.id === id ? { ...project, deleted_at: new Date().toISOString() } : project
      ));
      toast.success('Project moved to archive');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to archive project');
    }
  };

  const restoreProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ deleted_at: null })
        .eq('id', id);

      if (error) throw error;

      setProjects(prev => prev.map(project =>
        project.id === id ? { ...project, deleted_at: null } : project
      ));
      toast.success('Project restored successfully');
    } catch (error) {
      console.error('Error restoring project:', error);
      toast.error('Failed to restore project');
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
      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const value: ProjectContextType = {
    projects,
    loading,
    currentProject,
    setCurrentProject: (projectId: string) => setCurrentProject(projectId),
    addProject,
    updateProject,
    deleteProject: softDeleteProject,
    softDeleteProject,
    restoreProject,
    getProject,
    loadProjects,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
