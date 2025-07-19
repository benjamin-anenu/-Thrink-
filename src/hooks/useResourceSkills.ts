
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
      setResourceSkills([]);
      setLoading(false);
      return;
    }

    async function fetchResourceSkills() {
      setLoading(true);
      // For now, return mock data until resource_skills table is created
      const mockSkills: ResourceSkill[] = [
        {
          id: '1',
          resource_id: resourceId,
          skill_id: '1',
          skill_name: 'React',
          proficiency: 4,
          years_experience: 3
        },
        {
          id: '2',
          resource_id: resourceId,
          skill_id: '2',
          skill_name: 'TypeScript',
          proficiency: 3,
          years_experience: 2
        }
      ];
      setResourceSkills(mockSkills);
      setLoading(false);
    }
    fetchResourceSkills();
  }, [resourceId]);

  return { resourceSkills, loading };
}
