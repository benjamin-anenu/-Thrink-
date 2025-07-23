
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export interface Skill {
  id: string;
  name: string;
  description?: string;
  category?: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentWorkspace } = useWorkspace();

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      setError(null);
      
      try {
        if (currentWorkspace) {
          const { data, error } = await supabase
            .from('skills')
            .select('*')
            .eq('workspace_id', currentWorkspace.id)
            .order('name');
          
          if (error) throw error;
          
          const mappedSkills: Skill[] = (data || []).map(skill => ({
            id: skill.id,
            name: skill.name,
            description: skill.description,
            category: skill.category
          }));
          
          setSkills(mappedSkills);
        } else {
          setSkills([]);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills');
        setSkills([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSkills();
  }, [currentWorkspace]);

  return { skills, loading, error };
}
