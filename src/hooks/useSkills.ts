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
        // Fallback to predefined skills for now
        const predefinedSkills: Skill[] = [
          { id: '1', name: 'Project Management' },
          { id: '2', name: 'Software Development' },
          { id: '3', name: 'UI/UX Design' },
          { id: '4', name: 'Data Analysis' },
          { id: '5', name: 'Quality Assurance' },
          { id: '6', name: 'DevOps' },
          { id: '7', name: 'Business Analysis' },
          { id: '8', name: 'Marketing' },
          { id: '9', name: 'Sales' },
          { id: '10', name: 'Finance' },
        ];
        setSkills(predefinedSkills);
      } catch (err) {
        console.error('Error fetching skills:', err);
        setError('Failed to load skills');
        setSkills([]);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSkills();
  }, []);

  return { skills, loading, error };
}