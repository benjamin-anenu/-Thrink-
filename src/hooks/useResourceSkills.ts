
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
    if (!resourceId) {
      setLoading(false);
      return;
    }
    
    async function fetchResourceSkills() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('resource_skills')
          .select(`
            id, 
            resource_id, 
            skill_id, 
            proficiency, 
            years_experience,
            skills!inner(name)
          `)
          .eq('resource_id', resourceId);
          
        if (!error && data) {
          setResourceSkills(data.map((row: any) => ({
            id: row.id,
            resource_id: row.resource_id,
            skill_id: row.skill_id,
            proficiency: row.proficiency,
            years_experience: row.years_experience,
            skill_name: row.skills?.name || '',
          })));
        }
      } catch (error) {
        console.error('Error fetching resource skills:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchResourceSkills();
  }, [resourceId]);

  return { resourceSkills, loading };
}
