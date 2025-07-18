
import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

interface WorkspaceContextType {
  currentWorkspace: Workspace | null;
  workspaces: Workspace[];
  loading: boolean;
  setCurrentWorkspace: (workspace: Workspace) => void;
  loadWorkspaces: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    // Return a default workspace if context is not available
    return {
      currentWorkspace: {
        id: crypto.randomUUID(),
        name: 'Default Workspace',
        slug: 'default-workspace'
      },
      workspaces: [],
      loading: false,
      setCurrentWorkspace: () => {},
      loadWorkspaces: async () => {}
    };
  }
  return context;
};

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(false);

  const loadWorkspaces = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workspaces')
        .select('id, name, slug, description');
      
      if (error) throw error;
      
      setWorkspaces(data || []);
      if (data && data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0]);
      }
    } catch (error) {
      console.error('Error loading workspaces:', error);
      // Set default workspace on error
      const defaultWorkspace = {
        id: crypto.randomUUID(),
        name: 'Default Workspace',
        slug: 'default-workspace'
      };
      setCurrentWorkspace(defaultWorkspace);
      setWorkspaces([defaultWorkspace]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      currentWorkspace,
      workspaces,
      loading,
      setCurrentWorkspace,
      loadWorkspaces
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
};
