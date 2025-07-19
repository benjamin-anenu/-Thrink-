
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Skill {
  id: string;
  name: string;
  created_at: string;
}

export function useSkills() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkills() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
          
        if (!error && data) {
          setSkills(data);
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchSkills();
  }, []);

  return { skills, loading };
}
