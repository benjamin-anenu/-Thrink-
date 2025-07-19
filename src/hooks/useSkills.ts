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
      const { data, error } = await supabase
        .from('skills')
        .select('id, name')
        .order('name');
      if (!error && data) {
        setSkills(data);
      }
      setLoading(false);
    }
    fetchSkills();
  }, []);

  return { skills, loading };
} 