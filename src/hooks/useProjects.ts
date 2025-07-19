
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectOption {
  id: string;
  name: string;
  resources?: string[];
}

export function useProjects() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, resources')
        .order('name');
      if (!error && data) {
        setProjects(data.map(project => ({
          id: project.id,
          name: project.name,
          resources: project.resources || []
        })));
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  return { projects, loading };
}
