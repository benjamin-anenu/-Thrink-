import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ResourceSkill {
  id: string;
  resource_id: string;
  skill_id: string;
  skill_name: string;
  proficiency?: number;
  years_experience?: number;
}

export function useResourceSkills(resourceId: string) {
  const [resourceSkills, setResourceSkills] = useState<ResourceSkill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resourceId) return;
    async function fetchResourceSkills() {
      setLoading(true);
      const { data, error } = await supabase
        .from('resource_skills')
        .select('id, resource_id, skill_id, proficiency, years_experience, skills(name)')
        .eq('resource_id', resourceId);
      if (!error && data) {
        setResourceSkills(data.map((row: any) => ({
          ...row,
          skill_name: row.skills?.name || '',
        })));
      }
      setLoading(false);
    }
    fetchResourceSkills();
  }, [resourceId]);

  // Add, update, and remove functions can be added here as needed

  return { resourceSkills, loading };
} 