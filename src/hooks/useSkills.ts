
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Skill {
  id: string;
  name: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      // For now, return mock data until skills table is created
      const mockSkills: Skill[] = [
        { id: '1', name: 'React' },
        { id: '2', name: 'TypeScript' },
        { id: '3', name: 'Node.js' },
        { id: '4', name: 'Python' },
        { id: '5', name: 'UI/UX Design' },
        { id: '6', name: 'Project Management' },
        { id: '7', name: 'Agile' },
        { id: '8', name: 'DevOps' }
      ];
      setSkills(mockSkills);
      setLoading(false);
    }
    fetchSkills();
  }, []);

  return { skills, loading };
}
