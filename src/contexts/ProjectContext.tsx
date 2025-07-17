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
  // Additional UI properties
  progress?: number;
  priority?: string;
  team_size?: number;
  budget?: string;
  tags?: string[];
  resources?: string[];
  health_status?: string;
  health_score?: number;
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
  checkProjectDependencies: (id: string) => Promise<any[]>;
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
      console.log('[ProjectContext] Loading projects...');
      
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('[ProjectContext] No authenticated user, skipping project load');
        setProjects([]);
        setLoading(false);
        return;
      }
      
      console.log('[ProjectContext] User authenticated:', session.user.id);

      // First, let's check what workspaces the user has access to
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', session.user.id)
        .eq('status', 'active');

      if (workspaceError) {
        console.error('[ProjectContext] Error fetching user workspaces:', workspaceError);
        toast.error('Failed to load user workspaces');
        setLoading(false);
        return;
      }

      console.log('[ProjectContext] User workspaces:', workspaceData);

      if (!workspaceData || workspaceData.length === 0) {
        console.log('[ProjectContext] User has no active workspace memberships');
        setProjects([]);
        setLoading(false);
        return;
      }

      const workspaceIds = workspaceData.map(w => w.workspace_id);

      // Now fetch projects from user's workspaces, explicitly checking for non-deleted projects
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .in('workspace_id', workspaceIds)
        .is('deleted_at', null)  // Explicitly check for null instead of eq('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ProjectContext] Error loading projects:', error);
        toast.error('Failed to load projects: ' + error.message);
        setProjects([]);
        setLoading(false);
        return;
      }

      console.log('[ProjectContext] Raw projects from database:', data);

      // Transform the database data to match our interface
      const transformedProjects: Project[] = (data || []).map(project => {
        console.log('[ProjectContext] Transforming project:', project.name, 'Status:', project.status);
        return {
          ...project,
          status: project.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
          stakeholder_ids: project.stakeholder_ids || [],
          progress: project.progress || 0,
          priority: project.priority || 'Medium',
          team_size: project.team_size || 0,
          budget: project.budget || '',
          tags: project.tags || [],
          resources: project.resources || [],
          health_status: project.health_status || 'green',
          health_score: project.health_score || 100
        };
      });

      console.log('[ProjectContext] Transformed projects:', transformedProjects.length, 'projects loaded');
      setProjects(transformedProjects);
    } catch (error) {
      console.error('[ProjectContext] Unexpected error loading projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          description: projectData.description,
          status: projectData.status,
          start_date: projectData.start_date,
          end_date: projectData.end_date,
          workspace_id: projectData.workspace_id,
          stakeholder_ids: projectData.stakeholder_ids,
          progress: projectData.progress || 0,
          priority: projectData.priority || 'Medium',
          team_size: projectData.team_size || 0,
          budget: projectData.budget || '',
          tags: projectData.tags || [],
          resources: projectData.resources || [],
          health_status: projectData.health_status || 'green',
          health_score: projectData.health_score || 100
        }])
        .select()
        .single();

      if (error) throw error;

      const transformedProject: Project = {
        ...data,
        status: data.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
        stakeholder_ids: data.stakeholder_ids || [],
        progress: data.progress || 0,
        priority: data.priority || 'Medium',
        team_size: data.team_size || 0,
        budget: data.budget || '',
        tags: data.tags || [],
        resources: data.resources || [],
        health_status: data.health_status || 'green',
        health_score: data.health_score || 100
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
        ...data,
        status: data.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
        stakeholder_ids: data.stakeholder_ids || [],
        progress: data.progress || 0,
        priority: data.priority || 'Medium',
        team_size: data.team_size || 0,
        budget: data.budget || '',
        tags: data.tags || [],
        resources: data.resources || [],
        health_status: data.health_status || 'green',
        health_score: data.health_score || 100
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

      setProjects(prev => prev.filter(project => project.id !== id));
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

      await loadProjects(); // Refresh the list
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

  const checkProjectDependencies = async (id: string) => {
    try {
      const { data, error } = await supabase.rpc('check_project_dependencies', {
        project_id_param: id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error checking project dependencies:', error);
      return [];
    }
  };

  const getProject = (id: string): Project | undefined => {
    return projects.find(project => project.id === id);
  };

  useEffect(() => {
    console.log('[ProjectContext] Component mounted, loading projects...');
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
    checkProjectDependencies,
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};
