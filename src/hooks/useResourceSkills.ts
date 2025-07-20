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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resourceId) return;
    // Return empty array since 'resource_skills' table doesn't exist
    setResourceSkills([]);
    setLoading(false);
  }, [resourceId]);

  // Add, update, and remove functions can be added here as needed

  return { resourceSkills, loading };
}